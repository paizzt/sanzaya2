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
        
        $query = PaymentRequest::with(['requester', 'division', 'vendor'])
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
        
        if ($request->filled('status')) {
            if ($request->status === 'pending') {
                $query->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga']);
            } else {
                $query->where('workflow_status', $request->status);
            }
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

        $paymentRequests = $query->paginate(15)->withQueryString();

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $paymentRequests,
            'filters' => $request->only(['search', 'status', 'nominal', 'category']),
            'summary' => Inertia::defer(fn () => [
                'total' => PaymentRequest::where('requester_id', $user->id)->count(),
                'draft' => PaymentRequest::where('requester_id', $user->id)->where('workflow_status', 'draft')->count(),
                'waiting_approval' => PaymentRequest::where('requester_id', $user->id)->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga'])->count(),
                'paid' => PaymentRequest::where('requester_id', $user->id)->where('workflow_status', 'paid')->count(),
            ]),
        ]);
    }

    public function approvals(Request $request)
    {
        $user = Auth::user();
        
        $query = PaymentRequest::with(['requester', 'division', 'vendor'])
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

        if (empty($allowedStatuses)) {
            $query->whereHas('approvals', function($q) use ($user) {
                $q->where('approver_id', $user->id);
            });
        } else {
            $query->where(function($q) use ($allowedStatuses, $user) {
                $q->whereIn('workflow_status', $allowedStatuses)
                  ->orWhereHas('approvals', function($subQ) use ($user) {
                      $subQ->where('approver_id', $user->id);
                  });
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'pending') {
                $query->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga']);
            } elseif ($request->status === 'unprocessed') {
                $query->whereIn('workflow_status', $allowedStatuses);
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

        $paymentRequests = $query->paginate(15)->withQueryString();

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $paymentRequests,
            'filters' => $request->only(['search', 'status', 'deadline', 'nominal', 'category']),
            'isApprovalView' => true,
            'summary' => Inertia::defer(function () use ($query, $allowedStatuses) {
                $summaryData = (clone $query)->get(['id', 'payment_deadline', 'workflow_status']);
                $now = now()->startOfDay();
                $threeDaysLater = now()->addDays(3)->endOfDay();
                
                return [
                    'waiting_approval' => $summaryData->count(),
                    'unprocessed' => $summaryData->filter(function($pr) use ($allowedStatuses) {
                        return in_array($pr->workflow_status, $allowedStatuses);
                    })->count(),
                    'nearing_deadline' => $summaryData->filter(function($pr) use ($now, $threeDaysLater) {
                        return $pr->payment_deadline >= $now && $pr->payment_deadline <= $threeDaysLater;
                    })->count(),
                    'overdue' => $summaryData->filter(function($pr) use ($now) {
                        return $pr->payment_deadline < $now;
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
        if (!Auth::user()->hasPermissionTo('payment-request.create')) {
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

        if (!$user->hasPermissionTo('payment-request.create')) {
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

        try {
            DB::beginTransaction();

            $projectOrOutlet = $request->project_or_outlet ?: '-';
            if ($projectOrOutlet !== '-') {
                $mapping = \App\Models\OutletMapping::where('raw_name', $projectOrOutlet)->with('outlet')->first();
                if ($mapping && $mapping->outlet) {
                    $projectOrOutlet = $mapping->outlet->name;
                }
            }
            
            // Ensure notes column exists
            if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'notes')) {
                try {
                    \Illuminate\Support\Facades\Schema::table('payment_requests', function ($table) {
                        $table->text('notes')->nullable()->after('purpose');
                    });
                } catch (\Throwable $e) {}
            }

            // Create the record
            $paymentRequest = PaymentRequest::create([
                'reference_number' => $this->paymentService->generateReferenceNumber($user->division_id),
                'company_name' => $request->company_name,
                'requester_id' => $user->id,
                'division_id' => $user->division_id,
                'payment_deadline' => $request->payment_deadline,
                'transaction_date' => $request->transaction_date,
                'category' => $request->category,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'recipient_name' => $request->recipient_name,
                'letter_number' => $request->letter_number,
                'vendor_id' => $request->vendor_id,
                'invoice_reference' => $request->invoice_reference,
                'project_or_outlet' => $projectOrOutlet,
                'payment_method' => $request->payment_method,
                'bank_or_wallet' => $request->bank_or_wallet,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'account_used_before' => $request->account_used_before ?? false,
                'account_changed' => $request->account_changed ?? false,
                'account_change_note' => $request->account_change_note,
                'vat_status' => $request->vat_status ?? 'Tidak Dikenakan',
                'vat_rate' => $request->vat_rate ?? 0,
                'workflow_status' => 'waiting_ga',
                'created_by' => $user->id,
                'submission_date' => now(),
                'submitted_at' => now(),
            ]);

            // Save items
            $items = [];
            foreach ($request->items as $index => $item) {
                $items[] = [
                    'payment_request_id' => $paymentRequest->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'] ?? null,
                    'unit_price' => $item['unit_price'],
                    'amount' => $item['quantity'] * $item['unit_price'],
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            \App\Models\PaymentRequestItem::insert($items);

            // Calculate totals
            $totals = $this->paymentService->calculateTotals(
                $request->items,
                $request->discount ?? 0,
                $request->other_cost ?? 0,
                $request->vat_status ?? 'Tidak Dikenakan',
                $request->vat_rate ?? 0
            );

            $paymentRequest->update([
                'subtotal' => $totals['subtotal'],
                'discount' => $request->discount ?? 0,
                'other_cost' => $request->other_cost ?? 0,
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

            DB::commit();

            return redirect()->route('payment-requests.show', $paymentRequest->id)
                             ->with('success', 'Draft Pengajuan Pembayaran berhasil dibuat.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('PaymentRequest Store Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $paymentRequest = PaymentRequest::with([
            'requester', 'division', 'vendor', 
            'items', 'attachments', 'approvals.approver', 
            'financeVerifications.verifier', 'payments.processedBy'
        ])->findOrFail($id);

        $user = Auth::user();
        
        // Check Access
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if (!$isSuperAdmin && !$isAdmin && !$hasReviewFeature && !$user->hasPermissionTo('payment-request.view-all')) {
            if ($user->hasPermissionTo('payment-request.view-division') && $paymentRequest->division_id !== $user->division_id) {
                abort(403);
            }
            if (!$user->hasPermissionTo('payment-request.view-division') && $paymentRequest->requester_id !== $user->id) {
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

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => $paymentRequest,
            'completeness' => $completeness,
            'canApprove' => false,
            'canReject' => false,
            'isApprovalView' => false,
        ]);
    }

    public function showApproval($id)
    {
        $paymentRequest = PaymentRequest::with([
            'requester', 'division', 'vendor', 
            'items', 'attachments', 'approvals.approver', 
            'financeVerifications.verifier', 'payments.processedBy'
        ])->findOrFail($id);

        $user = Auth::user();
        
        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $isManajemen = $user->hasRoleCaseInsensitive(['MANAJEMEN', 'Manajemen', 'Manager', 'Direktur']);
        $isFinance = $user->hasRoleCaseInsensitive(['FINANCE', 'Finance', 'Keuangan']);
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if (!$isSuperAdmin && !$isAdmin && !$hasReviewFeature && !$user->hasPermissionTo('payment-request.review')) {
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

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => $paymentRequest,
            'completeness' => $completeness,
            'canApprove' => $canApprove,
            'canReject' => $canReject,
            'isApprovalView' => true
        ]);
    }

    public function edit($id)
    {
        $paymentRequest = PaymentRequest::with(['items', 'requester', 'division', 'attachments'])->findOrFail($id);
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
        $paymentRequest = PaymentRequest::with(['items', 'requester', 'division', 'attachments'])->findOrFail($id);
        $user = Auth::user();

        $isSuperAdmin = $user->isSuperAdminUser();
        $isAdmin = $user->isAdminUser();
        $hasReviewFeature = \App\Models\FeatureToggle::userHasFeature($user, 'Persetujuan Pembayaran');

        if (!$isSuperAdmin && !$isAdmin && !$hasReviewFeature && !$user->hasPermissionTo('payment-request.review')) {
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

        if (!$user->isSuperAdminUser() && !$user->isAdminUser() && ($paymentRequest->requester_id !== $user->id || !in_array($paymentRequest->workflow_status, ['draft', 'waiting_ga']))) {
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

        try {
            DB::beginTransaction();
            
            $projectOrOutlet = $request->project_or_outlet ?: ($paymentRequest->project_or_outlet ?: '-');
            if ($projectOrOutlet !== '-') {
                $mapping = \App\Models\OutletMapping::where('raw_name', $projectOrOutlet)->with('outlet')->first();
                if ($mapping && $mapping->outlet) {
                    $projectOrOutlet = $mapping->outlet->name;
                }
            }

            // Ensure notes column exists
            if (!\Illuminate\Support\Facades\Schema::hasColumn('payment_requests', 'notes')) {
                try {
                    \Illuminate\Support\Facades\Schema::table('payment_requests', function ($table) {
                        $table->text('notes')->nullable()->after('purpose');
                    });
                } catch (\Throwable $e) {}
            }

            $paymentRequest->update([
                'company_name' => $request->company_name,
                'payment_deadline' => $request->payment_deadline,
                'transaction_date' => $request->transaction_date,
                'category' => $request->category,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'recipient_name' => $request->recipient_name,
                'letter_number' => $request->letter_number,
                'vendor_id' => $request->vendor_id,
                'invoice_reference' => $request->invoice_reference,
                'project_or_outlet' => $projectOrOutlet,
                
                'payment_method' => $request->payment_method,
                'bank_or_wallet' => $request->bank_or_wallet,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'account_used_before' => $request->account_used_before,
                'account_changed' => $request->account_changed,
                'account_change_note' => $request->account_change_note,
                
                'vat_status' => $request->vat_status,
                'vat_rate' => $request->vat_rate,
                'discount' => $request->discount,
                'other_cost' => $request->other_cost,
            ]);

            // Sync items
            $paymentRequest->items()->delete();
            $totals = $this->paymentService->calculateTotals(
                $request->items,
                $request->discount ?? 0,
                $request->other_cost ?? 0,
                $request->vat_status ?? 'Tidak Dikenakan',
                $request->vat_rate ?? 0
            );

            foreach ($request->items as $item) {
                $paymentRequest->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'] ?? 'pcs',
                    'unit_price' => $item['unit_price'],
                    'amount' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            $paymentRequest->update([
                'subtotal' => $totals['subtotal'],
                'discount' => $request->discount ?? 0,
                'other_cost' => $request->other_cost ?? 0,
                'vat_amount' => $totals['vat_amount'],
                'grand_total' => $totals['grand_total'],
            ]);

            $this->paymentService->checkCompleteness($paymentRequest);

            // Hapus lampiran yang ditandai untuk dihapus
            if ($request->filled('deleted_attachment_ids')) {
                $deletedIds = $request->deleted_attachment_ids;
                if (!is_array($deletedIds)) {
                    $deletedIds = explode(',', $deletedIds);
                }
                $toDelete = \App\Models\PaymentRequestAttachment::where('payment_request_id', $paymentRequest->id)
                    ->whereIn('id', $deletedIds)
                    ->get();
                foreach ($toDelete as $att) {
                    if (!str_starts_with($att->file_path, 'http')) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($att->file_path);
                    }
                    $att->delete();
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

            DB::commit();

            if ($request->query('isApprovalView')) {
                return redirect()->route('payment-approvals.show', $paymentRequest->id)
                                 ->with('success', 'Draft Pengajuan Pembayaran berhasil diperbarui.');
            }

            return redirect()->route('payment-requests.show', $paymentRequest->id)
                             ->with('success', 'Draft Pengajuan Pembayaran berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('PaymentRequest Update Error: ' . $e->getMessage());
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

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil disetujui.');
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['notes' => 'required|string']);

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

        DB::transaction(function () use ($paymentRequest, $user, $request) {
            \App\Models\PaymentRequestApproval::create([
                'payment_request_id' => $paymentRequest->id,
                'approver_id' => $user->id,
                'approval_stage' => $paymentRequest->workflow_status,
                'action' => 'rejected',
                'notes' => $request->notes,
                'acted_at' => now(),
            ]);

            $paymentRequest->update([
                'workflow_status' => 'rejected',
            ]);
        });

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil ditolak.');
    }

    public function revise(Request $request, $id)
    {
        $request->validate(['notes' => 'required|string']);

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

        DB::transaction(function () use ($paymentRequest, $user, $request) {
            \App\Models\PaymentRequestApproval::create([
                'payment_request_id' => $paymentRequest->id,
                'approver_id' => $user->id,
                'approval_stage' => $paymentRequest->workflow_status,
                'action' => 'returned',
                'notes' => $request->notes,
                'acted_at' => now(),
            ]);

            $paymentRequest->update([
                'workflow_status' => 'draft',
            ]);
        });

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

        if ($isSuperAdmin || $isAdmin || $hasReviewFeature || $user->hasPermissionTo('payment-request.view-all')) {
            $canView = true;
        } elseif ($user->hasPermissionTo('payment-request.view-division') && $paymentRequest->division_id == $user->division_id) {
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
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::setOptions(['isRemoteEnabled' => true])->loadView('pdf.payment_request', [
                'paymentRequest' => $paymentRequest,
                'qrCode' => $qrCode
            ]);

            $filename = 'Pengajuan_Pembayaran_' . str_replace(['/', '\\'], '-', $paymentRequest->reference_number) . '.pdf';
            return $pdf->download($filename);
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
