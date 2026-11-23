<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PaymentRequest;
use App\Models\PaymentApprovalThreshold;
use App\Models\Provider;
use App\Services\PaymentRequestService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentRequestController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentRequestService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = PaymentRequest::with(['requester', 'division', 'vendor', 'latestRevision.approver', 'approvals.approver'])
            ->latest('created_at');

        $query->where('requester_id', $user->id);

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('nominal')) {
            $nominal = $request->nominal;
            if ($nominal === 'under_1m') {
                $query->where('grand_total', '<', 1000000);
            } elseif ($nominal === '1m_to_10m') {
                $query->where('grand_total', '>=', 1000000)->where('grand_total', '<=', 10000000);
            } elseif ($nominal === 'under_10m') {
                $query->where('grand_total', '<', 10000000);
            } elseif ($nominal === 'above_10m') {
                $query->where('grand_total', '>', 10000000);
            }
        }

        if ($request->filled('category')) {
            $cat = $request->category;
            if ($cat === 'Entertaint' || $cat === 'Entertain') {
                $query->where(function($q) {
                    $q->where('category', 'like', '%Entertain%');
                });
            } elseif ($cat === 'Purchasing' || $cat === 'Pengajuan Purchasing') {
                $query->where(function($q) {
                    $q->where('category', 'like', '%Purchasing%');
                });
            } else {
                $query->where('category', 'like', "%{$cat}%");
            }
        }

        // Persistent PT filter in session
        if ($request->has('company')) {
            $companyFilter = $request->input('company');
            if (!empty($companyFilter)) {
                session(['payment_requests_company' => $companyFilter]);
            } else {
                session()->forget('payment_requests_company');
            }
        } elseif ($request->boolean('reset') || $request->has('reset_company')) {
            session()->forget('payment_requests_company');
            $companyFilter = null;
        } else {
            $companyFilter = session('payment_requests_company', null);
        }

        if (!empty($companyFilter)) {
            $query->where('company_name', $companyFilter);
        }

        // Base query for summary calculations before status filter
        $baseSummary = PaymentRequest::where('requester_id', $user->id);
        if (!empty($companyFilter)) {
            $baseSummary->where('company_name', $companyFilter);
        }

        if ($request->filled('status')) {
            if ($request->status === 'pending') {
                $query->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga']);
            } else {
                $query->where('workflow_status', $request->status);
            }
        }

        $companyNames = \App\Models\Company::orderBy('name')->pluck('name')->toArray();
        $existingNames = PaymentRequest::whereNotNull('company_name')->where('company_name', '!=', '')->distinct()->pluck('company_name')->toArray();
        $allCompanyNames = array_values(array_unique(array_filter(array_merge($companyNames, $existingNames))));
        sort($allCompanyNames);

        $paymentRequests = $query->paginate(15)->withQueryString();

        $filters = array_merge(
            $request->only(['search', 'status', 'nominal', 'category']),
            ['company' => $companyFilter ?: '']
        );

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $paymentRequests,
            'filters' => $filters,
            'companies' => $allCompanyNames,
            'summary' => Inertia::defer(function () use ($baseSummary) {
                $data = (clone $baseSummary)->get(['id', 'workflow_status']);
                return [
                    'total' => $data->count(),
                    'draft' => $data->where('workflow_status', 'draft')->count(),
                    'waiting_approval' => $data->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga'])->count(),
                    'paid' => $data->where('workflow_status', 'paid')->count(),
                ];
            }),
        ]);
    }

    public function approvals(Request $request)
    {
        $user = Auth::user();
        
        $query = PaymentRequest::with(['requester', 'division', 'vendor', 'latestRevision.approver', 'approvals.approver'])
            ->latest('created_at');

        // RBAC for approvals
        $allowedStatuses = [];
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if ($isSuperAdmin || $isAdmin) {
            $allowedStatuses = ['waiting_supervisor', 'waiting_ga'];
        } else {
            if ($isManajemen) {
                $allowedStatuses[] = 'waiting_supervisor';
            }
            if ($isFinance) {
                $allowedStatuses[] = 'waiting_ga';
            }
            if ($hasReviewFeature && empty($allowedStatuses)) {
                $allowedStatuses = ['waiting_supervisor', 'waiting_ga'];
            }
        }

        // Base RBAC scope
        $query->where(function($q) use ($allowedStatuses, $user, $isSuperAdmin, $isAdmin, $isFinance, $isManajemen) {
            // 1. Sedang menunggu persetujuan
            if (!empty($allowedStatuses)) {
                $q->whereIn('workflow_status', $allowedStatuses);
            }
            // 2. Berstatus revisi (draft yang pernah dikembalikan reviewer)
            $q->orWhere(function($subQ) {
                $subQ->where('workflow_status', 'draft')
                     ->whereHas('approvals', function($appQ) {
                         $appQ->where('action', 'returned');
                     });
            });
            // 3. Riwayat persetujuan yang pernah diproses oleh user ini
            $q->orWhereHas('approvals', function($subQ) use ($user) {
                $subQ->where('approver_id', $user->id);
            });
            // 4. Admin / SuperAdmin dapat melihat semua riwayat
            if ($isSuperAdmin || $isAdmin) {
                $q->orWhereIn('workflow_status', ['approved', 'rejected', 'paid']);
            }
        });

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('nominal')) {
            $nominal = $request->nominal;
            if ($nominal === 'under_1m') {
                $query->where('grand_total', '<', 1000000);
            } elseif ($nominal === '1m_to_10m') {
                $query->where('grand_total', '>=', 1000000)->where('grand_total', '<=', 10000000);
            } elseif ($nominal === 'under_10m') {
                $query->where('grand_total', '<', 10000000);
            } elseif ($nominal === 'above_10m') {
                $query->where('grand_total', '>', 10000000);
            }
        }

        if ($request->filled('category')) {
            $cat = $request->category;
            if ($cat === 'Entertaint' || $cat === 'Entertain') {
                $query->where(function($q) {
                    $q->where('category', 'like', '%Entertain%');
                });
            } elseif ($cat === 'Purchasing' || $cat === 'Pengajuan Purchasing') {
                $query->where(function($q) {
                    $q->where('category', 'like', '%Purchasing%');
                });
            } else {
                $query->where('category', 'like', "%{$cat}%");
            }
        }

        // Persistent PT filter in session for Persetujuan Pembayaran
        if ($request->has('company')) {
            $companyFilter = $request->input('company');
            if (!empty($companyFilter)) {
                session(['payment_approvals_company' => $companyFilter]);
            } else {
                session()->forget('payment_approvals_company');
            }
        } elseif ($request->boolean('reset') || $request->has('reset_company')) {
            session()->forget('payment_approvals_company');
            $companyFilter = null;
        } else {
            $companyFilter = session('payment_approvals_company', null);
        }

        if (!empty($companyFilter)) {
            $query->where('company_name', $companyFilter);
        }

        // Clone query for summary calculation BEFORE applying status and deadline filters
        $summaryBaseQuery = clone $query;

        if ($request->filled('status')) {
            if ($request->status === 'pending') {
                $query->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga']);
            } elseif ($request->status === 'unprocessed') {
                $query->whereIn('workflow_status', $allowedStatuses);
            } elseif ($request->status === 'draft') {
                $query->where('workflow_status', 'draft')
                      ->whereHas('approvals', function($appQ) {
                          $appQ->where('action', 'returned');
                      });
            } else {
                $query->where('workflow_status', $request->status);
            }
        }

        if ($request->filled('deadline')) {
            $now = now()->startOfDay();
            if ($request->deadline === 'nearing') {
                $threeDaysLater = now()->addDays(3)->endOfDay();
                $query->where('payment_deadline', '>=', $now)
                      ->where('payment_deadline', '<=', $threeDaysLater);
            } elseif ($request->deadline === 'overdue') {
                $query->where('payment_deadline', '<', $now);
            }
        }

        $companyNames = \App\Models\Company::orderBy('name')->pluck('name')->toArray();
        $existingNames = PaymentRequest::whereNotNull('company_name')->where('company_name', '!=', '')->distinct()->pluck('company_name')->toArray();
        $allCompanyNames = array_values(array_unique(array_filter(array_merge($companyNames, $existingNames))));
        sort($allCompanyNames);

        $paymentRequests = $query->paginate(15)->withQueryString();

        $filters = array_merge(
            $request->only(['search', 'status', 'deadline', 'nominal', 'category']),
            ['company' => $companyFilter ?: '']
        );

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $paymentRequests,
            'filters' => $filters,
            'isApprovalView' => true,
            'companies' => $allCompanyNames,
            'summary' => Inertia::defer(function () use ($summaryBaseQuery, $allowedStatuses) {
                $summaryData = $summaryBaseQuery->get(['id', 'payment_deadline', 'workflow_status']);
                $now = now()->startOfDay();
                $threeDaysLater = now()->addDays(3)->endOfDay();
                
                return [
                    'waiting_approval' => $summaryData->filter(function($pr) use ($allowedStatuses) {
                        return in_array($pr->workflow_status, $allowedStatuses);
                    })->count(),
                    'unprocessed' => $summaryData->filter(function($pr) use ($allowedStatuses) {
                        return in_array($pr->workflow_status, $allowedStatuses);
                    })->count(),
                    'nearing_deadline' => $summaryData->filter(function($pr) use ($now, $threeDaysLater, $allowedStatuses) {
                        return in_array($pr->workflow_status, $allowedStatuses) && $pr->payment_deadline && $pr->payment_deadline >= $now && $pr->payment_deadline <= $threeDaysLater;
                    })->count(),
                    'overdue' => $summaryData->filter(function($pr) use ($now, $allowedStatuses) {
                        return in_array($pr->workflow_status, $allowedStatuses) && $pr->payment_deadline && $pr->payment_deadline < $now;
                    })->count(),
                    'draft' => $summaryData->filter(function($pr) {
                        return $pr->workflow_status === 'draft';
                    })->count(),
                ];
            }),
        ]);
    }

    public function create()
    {
        if (!Auth::user()->can('payment-request.create')) {
            abort(403, 'Unauthorized action.');
        }

        $vendors = Provider::select('id', 'name')->get();
        $companies = \App\Models\Company::select('id', 'name')->get();

        return Inertia::render('PaymentRequests/Create', [
            'vendors' => $vendors,
            'companies' => $companies,
            'user' => Auth::user()->load('division')
        ]);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('PaymentRequest store hit!', $request->all());
        $user = Auth::user();

        if (!$user->can('payment-request.create')) {
            abort(403, 'Unauthorized action.');
        }

        if (!$user->division_id) {
            return back()->with('error', 'Gagal: Akun Anda belum memiliki Divisi. Hubungi admin untuk mengatur divisi Anda.');
        }
        
        $request->validate([
            'company_name' => 'required|string',
            'payment_deadline' => 'required|date',
            'transaction_date' => 'required|date',
            'category' => 'required|string',
            'purpose' => 'required|string',
            'notes' => 'nullable|string',
            'recipient_name' => 'required|string',
            'letter_number' => 'nullable|string',
            'project_or_outlet' => 'nullable|string',
            'payment_method' => 'required|string',
            'bank_or_wallet' => 'nullable|required_unless:payment_method,Tunai|string',
            'account_number' => 'nullable|required_unless:payment_method,Tunai|string',
            'account_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ], [
            'company_name.required' => 'Nama perusahaan wajib diisi.',
            'payment_deadline.required' => 'Batas akhir pembayaran wajib diisi.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
            'category.required' => 'Kategori pengajuan wajib diisi.',
            'purpose.required' => 'Perihal atau tujuan wajib diisi.',
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'bank_or_wallet.required_unless' => 'Bank / E-Wallet wajib diisi jika metode pembayaran bukan Tunai.',
            'account_number.required_unless' => 'Nomor rekening atau QRIS wajib diisi jika metode pembayaran bukan Tunai.',
            'account_name.required' => 'Atas nama rekening atau penerima wajib diisi.',
            'items.required' => 'Rincian anggaran wajib diisi minimal 1 baris.',
            'items.min' => 'Rincian anggaran wajib diisi minimal 1 baris.',
            'items.*.description.required' => 'Uraian rincian anggaran wajib diisi.',
            'items.*.quantity.required' => 'Qty rincian anggaran wajib diisi.',
            'items.*.quantity.min' => 'Qty rincian anggaran minimal 1.',
            'items.*.unit_price.required' => 'Harga satuan rincian anggaran wajib diisi.',
        ]);

        // Ensure optional columns exist BEFORE starting any DB transaction (DDL causes implicit commit in MySQL)
        $hasNotesCol = false;
        $hasLetterNumberCol = false;
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'notes')) {
                \Illuminate\Support\Facades\Schema::table('payment_requests', function ($table) {
                    $table->text('notes')->nullable()->after('purpose');
                });
            }
            $hasNotesCol = \Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'notes');
        } catch (\Throwable $e) {}
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'letter_number')) {
                \Illuminate\Support\Facades\Schema::table('payment_requests', function ($table) {
                    $table->string('letter_number')->nullable()->after('purpose');
                });
            }
            $hasLetterNumberCol = \Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'letter_number');
        } catch (\Throwable $e) {}

        $normalizeDate = function ($val) {
            if (empty($val)) return null;
            $str = trim((string) $val);
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $str)) {
                return $str;
            }
            return \Carbon\Carbon::parse($str)->timezone(config('app.timezone'))->format('Y-m-d');
        };

        try {
            DB::beginTransaction();

            $projectOrOutlet = $request->project_or_outlet ?: '-';
            if ($projectOrOutlet !== '-') {
                $mapping = \App\Models\OutletMapping::where('raw_name', $projectOrOutlet)->with('outlet')->first();
                if ($mapping && $mapping->outlet) {
                    $projectOrOutlet = $mapping->outlet->name;
                }
            }

            $discount = (float) ($request->discount ?? 0);
            $otherCost = (float) ($request->other_cost ?? 0);
            $vatStatus = $request->vat_status ?: 'Tidak Dikenakan';
            $vatRate = (float) ($request->vat_rate ?? 0);

            $createData = [
                'reference_number' => $this->paymentService->generateReferenceNumber($user->division_id),
                'company_name' => $request->company_name,
                'requester_id' => $user->id,
                'division_id' => $user->division_id,
                'payment_deadline' => $normalizeDate($request->payment_deadline),
                'transaction_date' => $normalizeDate($request->transaction_date),
                'category' => $request->category,
                'purpose' => $request->purpose,
                'recipient_name' => $request->recipient_name,
                'vendor_id' => $request->filled('vendor_id') ? $request->vendor_id : null,
                'invoice_reference' => $request->invoice_reference,
                'project_or_outlet' => $projectOrOutlet,
                'payment_method' => $request->payment_method,
                'bank_or_wallet' => $request->bank_or_wallet,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'account_used_before' => $request->boolean('account_used_before'),
                'account_changed' => $request->boolean('account_changed'),
                'account_change_note' => $request->account_change_note,
                'vat_status' => $vatStatus,
                'vat_rate' => $vatRate,
                'workflow_status' => 'waiting_ga',
                'created_by' => $user->id,
                'submission_date' => now()->format('Y-m-d'),
                'submitted_at' => now(),
            ];
            if ($hasNotesCol) {
                $createData['notes'] = $request->notes;
            }
            if ($hasLetterNumberCol) {
                $createData['letter_number'] = $request->letter_number;
            }

            // Create the record
            $paymentRequest = PaymentRequest::create($createData);

            // Save items
            $items = [];
            foreach ($request->items as $index => $item) {
                $qty = max(1, (int) round((float) ($item['quantity'] ?? 1)));
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $items[] = [
                    'payment_request_id' => $paymentRequest->id,
                    'description' => $item['description'],
                    'quantity' => $qty,
                    'unit' => $item['unit'] ?? null,
                    'unit_price' => $unitPrice,
                    'amount' => $qty * $unitPrice,
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            \App\Models\PaymentRequestItem::insert($items);

            // Calculate totals
            $totals = $this->paymentService->calculateTotals(
                $request->items,
                $discount,
                $otherCost,
                $vatStatus,
                $vatRate
            );

            $paymentRequest->update([
                'subtotal' => $totals['subtotal'],
                'discount' => $discount,
                'other_cost' => $otherCost,
                'vat_amount' => $totals['vat_amount'],
                'grand_total' => $totals['grand_total'],
            ]);

            // Completeness check
            $this->paymentService->checkCompleteness($paymentRequest);

            if ($request->hasFile('lampiran_foto')) {
                $files = $request->file('lampiran_foto');
                if (!is_array($files)) {
                    $files = [$files];
                }
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $this->uploadAttachmentFile($file, $paymentRequest->id, $user->id);
                    }
                }
            }

            if (DB::transactionLevel() > 0) {
                DB::commit();
            }

            return redirect()->route('payment-requests.show', $paymentRequest->id)
                             ->with('success', 'Draft Pengajuan Pembayaran berhasil dibuat.');

        } catch (\Throwable $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            \Illuminate\Support\Facades\Log::error('PaymentRequest Store Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $paymentRequest = PaymentRequest::with([
            'requester', 'division', 'vendor', 
            'items', 'attachments', 'approvals.approver.division', 'latestRevision.approver.division',
            'financeVerifications.verifier', 'payments.processedBy'
        ])->findOrFail($id);

        $user = Auth::user();
        
        // Check Access
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if (!$isSuperAdmin && !$isAdmin && !$hasReviewFeature && !$user->can('payment-request.view-all')) {
            if ($user->can('payment-request.view-division') && $paymentRequest->division_id !== $user->division_id) {
                abort(403);
            }
            if (!$user->can('payment-request.view-division') && $paymentRequest->requester_id !== $user->id) {
                abort(403);
            }
        }

        $completeness = $this->paymentService->checkCompleteness($paymentRequest);

        $canApprove = false;
        $canReject = false;

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && ($isManajemen || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isFinance))) {
            $canApprove = true;
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && ($isFinance || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isManajemen))) {
            $canApprove = true;
            $canReject = true;
        } elseif (($isSuperAdmin || $isAdmin || $hasReviewFeature) && in_array($paymentRequest->workflow_status, ['waiting_supervisor', 'waiting_ga'])) {
            $canApprove = true;
            $canReject = true;
        }

        $isRequester = $paymentRequest->requester_id === $user->id;
        $canEdit = ($isRequester && in_array($paymentRequest->workflow_status, ['draft', 'waiting_ga'])) || $isSuperAdmin || $isAdmin;
        $canSubmit = ($isRequester || $isSuperAdmin || $isAdmin) && $paymentRequest->workflow_status === 'draft';

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => $paymentRequest,
            'completeness' => $completeness,
            'canApprove' => false,
            'canReject' => false,
            'canEdit' => $canEdit,
            'canSubmit' => $canSubmit,
            'isApprovalView' => false,
        ]);
    }

    public function showApproval($id)
    {
        $paymentRequest = PaymentRequest::with([
            'requester', 'division', 'vendor', 
            'items', 'attachments', 'approvals.approver.division', 'latestRevision.approver.division',
            'financeVerifications.verifier', 'payments.processedBy'
        ])->findOrFail($id);

        $user = Auth::user();
        
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if (!$isSuperAdmin && !$isAdmin && !$hasReviewFeature && !$user->can('payment-request.review')) {
            abort(403);
        }

        $completeness = $this->paymentService->checkCompleteness($paymentRequest);

        $canApprove = false;
        $canReject = false;

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && ($isManajemen || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isFinance))) {
            $canApprove = true;
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && ($isFinance || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isManajemen))) {
            $canApprove = true;
            $canReject = true;
        } elseif (($isSuperAdmin || $isAdmin || $hasReviewFeature) && in_array($paymentRequest->workflow_status, ['waiting_supervisor', 'waiting_ga'])) {
            $canApprove = true;
            $canReject = true;
        }

        $isRequester = $paymentRequest->requester_id === $user->id;
        $canEdit = ($isRequester && in_array($paymentRequest->workflow_status, ['draft', 'waiting_ga'])) || $isSuperAdmin || $isAdmin || $hasReviewFeature;
        $canSubmit = ($isRequester || $isSuperAdmin || $isAdmin) && $paymentRequest->workflow_status === 'draft';

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => $paymentRequest,
            'completeness' => $completeness,
            'canApprove' => $canApprove,
            'canReject' => $canReject,
            'canEdit' => $canEdit,
            'canSubmit' => $canSubmit,
            'isApprovalView' => true
        ]);
    }

    public function edit($id)
    {
        $paymentRequest = PaymentRequest::with(['items', 'requester', 'division', 'attachments', 'latestRevision.approver', 'approvals.approver'])->findOrFail($id);
        $user = Auth::user();

        // Only requester can edit their draft/waiting_ga, except SUPERADMIN/Admin can edit anytime
        if (!$user->isSuperAdminUser() && !$user->isAdminUser() && ($paymentRequest->requester_id !== $user->id || !in_array($paymentRequest->workflow_status, ['draft', 'waiting_ga']))) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengajuan ini.');
        }

        $vendors = Provider::select('id', 'name')->get();
        $companies = \App\Models\Company::select('id', 'name')->get();

        return Inertia::render('PaymentRequests/Edit', [
            'paymentRequest' => $paymentRequest,
            'vendors' => $vendors,
            'companies' => $companies,
        ]);
    }

    public function editApproval($id)
    {
        $paymentRequest = PaymentRequest::with(['items', 'requester', 'division', 'attachments', 'latestRevision.approver', 'approvals.approver'])->findOrFail($id);
        $user = Auth::user();

        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if (!$isSuperAdmin && !$isAdmin && !$hasReviewFeature && !$user->can('payment-request.review')) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengajuan ini.');
        }

        $vendors = Provider::select('id', 'name')->get();
        $companies = \App\Models\Company::select('id', 'name')->get();

        return Inertia::render('PaymentRequests/Edit', [
            'paymentRequest' => $paymentRequest,
            'vendors' => $vendors,
            'companies' => $companies,
            'isApprovalView' => true,
        ]);
    }

    public function update(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');
        $canReview = $hasReviewFeature || $user->can('payment-request.review');
        $isEditableByRequester = ($paymentRequest->requester_id === $user->id && in_array($paymentRequest->workflow_status, ['draft', 'waiting_ga']));

        if (!$isSuperAdmin && !$isAdmin && !$canReview && !$isEditableByRequester) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengajuan ini.');
        }

        $request->validate([
            'company_name' => 'required|string',
            'payment_deadline' => 'required|date',
            'transaction_date' => 'required|date',
            'category' => 'required|string',
            'purpose' => 'required|string',
            'notes' => 'nullable|string',
            'recipient_name' => 'required|string',
            'letter_number' => 'nullable|string',
            'project_or_outlet' => 'nullable|string',
            'payment_method' => 'required|string',
            'bank_or_wallet' => 'nullable|required_unless:payment_method,Tunai|string',
            'account_number' => 'nullable|required_unless:payment_method,Tunai|string',
            'account_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ], [
            'company_name.required' => 'Nama perusahaan wajib diisi.',
            'payment_deadline.required' => 'Batas akhir pembayaran wajib diisi.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
            'category.required' => 'Kategori pengajuan wajib diisi.',
            'purpose.required' => 'Perihal atau tujuan wajib diisi.',
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'bank_or_wallet.required_unless' => 'Bank / E-Wallet wajib diisi jika metode pembayaran bukan Tunai.',
            'account_number.required_unless' => 'Nomor rekening atau QRIS wajib diisi jika metode pembayaran bukan Tunai.',
            'account_name.required' => 'Atas nama rekening atau penerima wajib diisi.',
            'items.required' => 'Rincian anggaran wajib diisi minimal 1 baris.',
            'items.min' => 'Rincian anggaran wajib diisi minimal 1 baris.',
            'items.*.description.required' => 'Uraian rincian anggaran wajib diisi.',
            'items.*.quantity.required' => 'Qty rincian anggaran wajib diisi.',
            'items.*.quantity.min' => 'Qty rincian anggaran minimal 1.',
            'items.*.unit_price.required' => 'Harga satuan rincian anggaran wajib diisi.',
        ]);

        // Ensure optional columns exist BEFORE starting DB transaction (DDL causes implicit commit in MySQL)
        $hasNotesCol = false;
        $hasLetterNumberCol = false;
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'notes')) {
                \Illuminate\Support\Facades\Schema::table('payment_requests', function ($table) {
                    $table->text('notes')->nullable()->after('purpose');
                });
            }
            $hasNotesCol = \Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'notes');
        } catch (\Throwable $e) {}
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'letter_number')) {
                \Illuminate\Support\Facades\Schema::table('payment_requests', function ($table) {
                    $table->string('letter_number')->nullable()->after('purpose');
                });
            }
            $hasLetterNumberCol = \Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'letter_number');
        } catch (\Throwable $e) {}

        $normalizeDate = function ($val) {
            if (empty($val)) return null;
            $str = trim((string) $val);
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $str)) {
                return $str;
            }
            return \Carbon\Carbon::parse($str)->timezone(config('app.timezone'))->format('Y-m-d');
        };

        try {
            DB::beginTransaction();
            
            $projectOrOutlet = $request->project_or_outlet ?: ($paymentRequest->project_or_outlet ?: '-');
            if ($projectOrOutlet !== '-') {
                $mapping = \App\Models\OutletMapping::where('raw_name', $projectOrOutlet)->with('outlet')->first();
                if ($mapping && $mapping->outlet) {
                    $projectOrOutlet = $mapping->outlet->name;
                }
            }

            $discount = (float) ($request->discount ?? 0);
            $otherCost = (float) ($request->other_cost ?? 0);
            $vatStatus = $request->vat_status ?: 'Tidak Dikenakan';
            $vatRate = (float) ($request->vat_rate ?? 0);

            $updateData = [
                'company_name' => $request->company_name,
                'payment_deadline' => $normalizeDate($request->payment_deadline),
                'transaction_date' => $normalizeDate($request->transaction_date),
                'category' => $request->category,
                'purpose' => $request->purpose,
                'recipient_name' => $request->recipient_name,
                'vendor_id' => $request->filled('vendor_id') ? $request->vendor_id : null,
                'invoice_reference' => $request->invoice_reference,
                'project_or_outlet' => $projectOrOutlet,
                
                'payment_method' => $request->payment_method,
                'bank_or_wallet' => $request->bank_or_wallet,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'account_used_before' => $request->boolean('account_used_before'),
                'account_changed' => $request->boolean('account_changed'),
                'account_change_note' => $request->account_change_note,
                
                'vat_status' => $vatStatus,
                'vat_rate' => $vatRate,
                'discount' => $discount,
                'other_cost' => $otherCost,
                'updated_by' => $user->id,
            ];
            if ($hasNotesCol) {
                $updateData['notes'] = $request->notes;
            }
            if ($hasLetterNumberCol) {
                $updateData['letter_number'] = $request->letter_number;
            }

            $paymentRequest->update($updateData);

            // Sync items
            $paymentRequest->items()->delete();
            $totals = $this->paymentService->calculateTotals(
                $request->items,
                $discount,
                $otherCost,
                $vatStatus,
                $vatRate
            );

            foreach ($request->items as $index => $item) {
                $qty = max(1, (int) round((float) ($item['quantity'] ?? 1)));
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $paymentRequest->items()->create([
                    'description' => $item['description'],
                    'quantity' => $qty,
                    'unit' => !empty($item['unit']) ? $item['unit'] : 'pcs',
                    'unit_price' => $unitPrice,
                    'amount' => $qty * $unitPrice,
                    'sort_order' => $index,
                ]);
            }

            $paymentRequest->update([
                'subtotal' => $totals['subtotal'],
                'discount' => $discount,
                'other_cost' => $otherCost,
                'vat_amount' => $totals['vat_amount'],
                'grand_total' => $totals['grand_total'],
            ]);

            $this->paymentService->checkCompleteness($paymentRequest);

            // Hapus lampiran yang ditandai untuk dihapus
            if ($request->filled('deleted_attachment_ids')) {
                $deletedIds = $request->deleted_attachment_ids;
                if (!is_array($deletedIds)) {
                    $deletedIds = explode(',', (string) $deletedIds);
                }
                $deletedIds = array_values(array_filter(array_map('intval', $deletedIds)));
                if (!empty($deletedIds)) {
                    $toDelete = \App\Models\PaymentRequestAttachment::where('payment_request_id', $paymentRequest->id)
                        ->whereIn('id', $deletedIds)
                        ->get();
                    foreach ($toDelete as $att) {
                        if (!empty($att->file_path) && !str_starts_with($att->file_path, 'http')) {
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($att->file_path);
                        }
                        $att->delete();
                    }
                }
            }

            // Tambah lampiran foto baru (bisa lebih dari 1 gambar)
            if ($request->hasFile('lampiran_foto')) {
                $files = $request->file('lampiran_foto');
                if (!is_array($files)) {
                    $files = [$files];
                }
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $this->uploadAttachmentFile($file, $paymentRequest->id, $user->id);
                    }
                }
            }

            $shouldSubmit = $request->boolean('submit_now') && $paymentRequest->workflow_status === 'draft';
            if ($shouldSubmit) {
                $completeness = $this->paymentService->checkCompleteness($paymentRequest);
                if ($completeness['is_complete']) {
                    $paymentRequest->update([
                        'workflow_status' => 'waiting_ga',
                        'submission_date' => now()->format('Y-m-d'),
                        'submitted_at' => now(),
                    ]);

                    \App\Models\PaymentRequestApproval::create([
                        'payment_request_id' => $paymentRequest->id,
                        'approver_id' => $user->id,
                        'approval_stage' => 'draft',
                        'action' => 'resubmitted',
                        'notes' => 'Pengajuan telah diperbaiki dan diajukan kembali ke Finance.',
                        'acted_at' => now(),
                    ]);
                }
            }

            if (DB::transactionLevel() > 0) {
                DB::commit();
            }

            if ($request->boolean('isApprovalView') || $request->query('isApprovalView')) {
                return redirect()->route('payment-approvals.show', $paymentRequest->id)
                                 ->with('success', $shouldSubmit ? 'Pengajuan berhasil diperbarui dan dikirim ke Finance.' : 'Pengajuan Pembayaran berhasil diperbarui.');
            }

            return redirect()->route('payment-requests.show', $paymentRequest->id)
                             ->with('success', $shouldSubmit ? 'Pengajuan berhasil diperbarui dan dikirim ke Finance.' : 'Pengajuan Pembayaran berhasil diperbarui.');

        } catch (\Throwable $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            \Illuminate\Support\Facades\Log::error('PaymentRequest Update Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function submit($id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        if ($paymentRequest->requester_id !== $user->id || $paymentRequest->workflow_status !== 'draft') {
            abort(403, 'Anda tidak memiliki akses untuk mengajukan ini.');
        }

        $paymentRequest->update([
            'workflow_status' => 'waiting_ga',
            'submission_date' => now(),
            'submitted_at' => now(),
        ]);

        $hasBeenReturned = \App\Models\PaymentRequestApproval::where('payment_request_id', $paymentRequest->id)
            ->where('action', 'returned')
            ->exists();

        if ($hasBeenReturned) {
            \App\Models\PaymentRequestApproval::create([
                'payment_request_id' => $paymentRequest->id,
                'approver_id' => $user->id,
                'approval_stage' => 'draft',
                'action' => 'resubmitted',
                'notes' => 'Pengajuan telah diperbaiki dan diajukan kembali ke Finance.',
                'acted_at' => now(),
            ]);
        }

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil dikirim dan sedang menunggu persetujuan Finance.');
    }

    public function approve(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        $canApprove = false;
        $nextStatus = '';
        $approvedField = '';

        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && ($isManajemen || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isFinance))) {
            $canApprove = true;
            $nextStatus = 'waiting_ga';
            $approvedField = 'supervisor_approved_at';
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && ($isFinance || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isManajemen))) {
            $canApprove = true;
            $nextStatus = 'approved';
            $approvedField = 'finance_verified_at';
        } elseif ($isSuperAdmin || $isAdmin || $hasReviewFeature) {
            $canApprove = true;
            if ($paymentRequest->workflow_status === 'waiting_supervisor') {
                $nextStatus = 'waiting_ga';
                $approvedField = 'supervisor_approved_at';
            } elseif ($paymentRequest->workflow_status === 'waiting_ga') {
                $nextStatus = 'approved';
                $approvedField = 'finance_verified_at';
            } else {
                $canApprove = false;
            }
        }

        if (!$canApprove) {
            abort(403, 'Anda tidak memiliki hak akses untuk menyetujui tahap ini.');
        }

        DB::transaction(function () use ($paymentRequest, $user, $request, $nextStatus, $approvedField) {
            \App\Models\PaymentRequestApproval::create([
                'payment_request_id' => $paymentRequest->id,
                'approver_id' => $user->id,
                'approval_stage' => $paymentRequest->workflow_status,
                'action' => 'approved',
                'notes' => $request->notes,
                'acted_at' => now(),
            ]);

            $paymentRequest->update([
                'workflow_status' => $nextStatus,
                $approvedField => now(),
            ]);
        });

        $isApprovalView = $request->boolean('isApprovalView') || ($request->header('referer') && str_contains($request->header('referer'), 'payment-approvals'));

        if ($isApprovalView) {
            return redirect()->route('payment-approvals.index')
                             ->with('success', 'Pengajuan berhasil disetujui.');
        }

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil disetujui.');
    }

    public function reject(Request $request, $id)
    {
        $notes = $request->input('notes') ?? $request->input('data.notes') ?? $request->input('alasan');
        if (empty($notes)) {
            return back()->with('error', 'Alasan penolakan wajib diisi.');
        }

        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        $canReject = false;
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && ($isManajemen || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isFinance))) {
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && ($isFinance || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isManajemen))) {
            $canReject = true;
        } elseif ($isSuperAdmin || $isAdmin || $hasReviewFeature) {
            $canReject = in_array($paymentRequest->workflow_status, ['waiting_supervisor', 'waiting_ga']);
        }

        if (!$canReject) {
            abort(403, 'Anda tidak memiliki hak akses untuk menolak tahap ini.');
        }

        DB::transaction(function () use ($paymentRequest, $user, $notes) {
            \App\Models\PaymentRequestApproval::create([
                'payment_request_id' => $paymentRequest->id,
                'approver_id' => $user->id,
                'approval_stage' => $paymentRequest->workflow_status,
                'action' => 'rejected',
                'notes' => $notes,
                'acted_at' => now(),
            ]);

            $paymentRequest->update([
                'workflow_status' => 'rejected',
            ]);
        });

        $isApprovalView = $request->boolean('isApprovalView') || ($request->header('referer') && str_contains($request->header('referer'), 'payment-approvals'));

        if ($isApprovalView) {
            return redirect()->route('payment-approvals.index')
                             ->with('success', 'Pengajuan berhasil ditolak.');
        }

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil ditolak.');
    }

    public function revise(Request $request, $id)
    {
        $notes = $request->input('notes') ?? $request->input('data.notes') ?? $request->input('catatan');
        if (empty($notes)) {
            return back()->with('error', 'Catatan revisi wajib diisi.');
        }

        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        $canRevise = false;
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && ($isManajemen || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isFinance))) {
            $canRevise = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && ($isFinance || $isSuperAdmin || $isAdmin || ($hasReviewFeature && !$isManajemen))) {
            $canRevise = true;
        } elseif ($isSuperAdmin || $isAdmin || $hasReviewFeature) {
            $canRevise = in_array($paymentRequest->workflow_status, ['waiting_supervisor', 'waiting_ga']);
        }

        if (!$canRevise) {
            abort(403, 'Anda tidak memiliki hak akses untuk meminta revisi tahap ini.');
        }

        DB::transaction(function () use ($paymentRequest, $user, $notes) {
            \App\Models\PaymentRequestApproval::create([
                'payment_request_id' => $paymentRequest->id,
                'approver_id' => $user->id,
                'approval_stage' => $paymentRequest->workflow_status,
                'action' => 'returned',
                'notes' => $notes,
                'acted_at' => now(),
            ]);

            $paymentRequest->update([
                'workflow_status' => 'draft',
            ]);
        });

        $isApprovalView = $request->boolean('isApprovalView') || ($request->header('referer') && str_contains($request->header('referer'), 'payment-approvals'));

        if ($isApprovalView) {
            return redirect()->route('payment-approvals.index')
                             ->with('success', 'Pengajuan berhasil dikembalikan untuk direvisi.');
        }

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil dikembalikan untuk direvisi.');
    }

    public function downloadPdf(PaymentRequest $paymentRequest)
    {
        $user = Auth::user();
        
        // Basic authorization check
        $canView = false;
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if ($isSuperAdmin || $isAdmin || $hasReviewFeature || $user->can('payment-request.view-all')) {
            $canView = true;
        } elseif ($user->can('payment-request.view-division') && $paymentRequest->division_id == $user->division_id) {
            $canView = true;
        } elseif ($paymentRequest->requester_id == $user->id) {
            $canView = true;
        } elseif ($isManajemen || $isFinance) {
            // Approvers can view
            $canView = true;
        } elseif ($paymentRequest->approvals()->where('approver_id', $user->id)->exists()) {
            $canView = true;
        }

        if (!$canView) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat pengajuan ini.');
        }

        $paymentRequest->load(['requester', 'division', 'vendor', 'items', 'attachments', 'approvals.approver']);

        if ($paymentRequest->attachments) {
            foreach ($paymentRequest->attachments as $attachment) {
                $attachment->base64_src = $this->resolveAttachmentBase64($attachment->file_path);
            }
        }

        $qrUrl = url('/payment-requests/' . $paymentRequest->id);
        $qrCode = base64_encode(\SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(100)->generate($qrUrl));

        try {
            $paper = request()->query('paper') === 'f4' ? [0, 0, 609.4488, 935.433] : request()->query('paper', 'a4');
            $orientation = request()->query('orientation', 'portrait');

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::setOptions(['isRemoteEnabled' => true, 'isHtml5ParserEnabled' => true])
                ->loadView('pdf.payment_request', [
                    'paymentRequest' => $paymentRequest,
                    'qrCode' => $qrCode
                ])
                ->setPaper($paper, $orientation);

            $filename = 'Pengajuan_Pembayaran_' . str_replace(['/', '\\'], '-', $paymentRequest->reference_number) . '.pdf';
            return (request()->has('preview') || request()->has('stream')) ? $pdf->stream($filename) : $pdf->download($filename);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("PR PDF Error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
            return response("Terjadi kesalahan saat membuat PDF: " . $e->getMessage() . " (Baris " . $e->getLine() . ")", 500);
        }
    }

    /**
     * Resolves an attachment file path (local or remote URL) into a base64 Data URI for DomPDF
     */
    private function resolveAttachmentBase64(?string $filePath): ?string
    {
        $res = \App\Helpers\PdfImageHelper::toBase64($filePath, 700);
        return $res !== '' ? $res : null;
    }

    public function destroy($id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);
        
        if (!Auth::user()->isSuperAdminUser() && !Auth::user()->isAdminUser()) {
            abort(403, 'Hanya superadmin / admin yang dapat menghapus pengajuan.');
        }

        DB::beginTransaction();
        try {
            // Delete related items and verifications explicitly if no cascade on DB level
            $paymentRequest->items()->delete();
            $paymentRequest->approvals()->delete();
            $paymentRequest->delete();
            DB::commit();
            return redirect()->back()->with('success', 'Pengajuan berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus data.');
        }
    }

    /**
     * Upload helper for payment request attachments
     */
    private function uploadAttachmentFile($file, $paymentRequestId, $userId)
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $isImage = in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']);
        $path = null;

        if ($isImage) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(15)->attach(
                    'image', 
                    file_get_contents($file->getRealPath()), 
                    $file->getClientOriginalName()
                )->post('https://api.imgbb.com/1/upload', [
                    'key' => '5950b44b24860057ff810fe73f58868b'
                ]);

                if ($response->successful() && $response->json('data.url')) {
                    $path = $response->json('data.url');
                } else {
                    $path = $file->store('payment_requests', 'public');
                }
            } catch (\Throwable $e) {
                $path = $file->store('payment_requests', 'public');
            }
        } else {
            $path = $file->store('payment_requests', 'public');
        }

        \Illuminate\Support\Facades\DB::table('payment_request_attachments')->insert([
            'payment_request_id' => $paymentRequestId,
            'attachment_type' => $isImage ? 'Lampiran Foto' : 'Lampiran Dokumen',
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => basename($path),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
            'file_size' => $file->getSize() ?: 0,
            'uploaded_by' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Hapus satu file lampiran
     */
    public function deleteAttachment($id)
    {
        $attachment = \App\Models\PaymentRequestAttachment::findOrFail($id);
        $user = Auth::user();
        $pr = $attachment->paymentRequest;

        if (!$user->isSuperAdminUser() && !$user->isAdminUser() && $pr->requester_id !== $user->id) {
            abort(403);
        }

        if (!str_starts_with($attachment->file_path, 'http')) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
        }
        $attachment->delete();

        return redirect()->back()->with('success', 'Lampiran berhasil dihapus.');
    }

    /**
     * Unduh file lampiran
     */
    public function downloadAttachment($id)
    {
        $attachment = \App\Models\PaymentRequestAttachment::findOrFail($id);

        if (str_starts_with($attachment->file_path, 'http')) {
            if (str_contains($attachment->file_path, 'i.ibb.co')) {
                return redirect('https://wsrv.nl/?url=' . urlencode($attachment->file_path));
            }
            return redirect($attachment->file_path);
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($attachment->file_path)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->download(
                $attachment->file_path,
                $attachment->original_name ?: basename($attachment->file_path)
            );
        }

        $fallbackPath = public_path('storage/' . $attachment->file_path);
        if (file_exists($fallbackPath)) {
            return response()->download($fallbackPath, $attachment->original_name ?: basename($attachment->file_path));
        }

        return redirect()->back()->with('error', 'File lampiran tidak ditemukan di server.');
    }
}
