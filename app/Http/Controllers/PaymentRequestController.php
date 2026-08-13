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
            $query->where('workflow_status', $request->status);
        }

        $paymentRequests = $query->paginate(15)->withQueryString();

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $paymentRequests,
            'filters' => $request->only(['search', 'status']),
            'summary' => Inertia::defer(fn () => [
                'total' => PaymentRequest::where('requester_id', $user->id)->count(),
                'draft' => PaymentRequest::where('requester_id', $user->id)->where('workflow_status', 'draft')->count(),
                'waiting_approval' => PaymentRequest::where('requester_id', $user->id)->whereIn('workflow_status', ['waiting_supervisor', 'waiting_ga', 'waiting_director'])->count(),
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
        if ($user->hasRole('Manager')) {
            $allowedStatuses[] = 'waiting_supervisor';
        }
        if ($user->hasRole('General Accounting')) {
            $allowedStatuses[] = 'waiting_ga';
        }
        if ($user->hasRole('Direktur')) {
            $allowedStatuses[] = 'waiting_director';
        }
        if ($user->hasRole('Superadmin')) {
            $allowedStatuses = ['waiting_supervisor', 'waiting_ga', 'waiting_director'];
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
            $query->where('workflow_status', $request->status);
        }

        $paymentRequests = $query->paginate(15)->withQueryString();

        return Inertia::render('PaymentRequests/Index', [
            'paymentRequests' => $paymentRequests,
            'filters' => $request->only(['search', 'status']),
            'isApprovalView' => true,
            'summary' => Inertia::defer(function () use ($query) {
                $summaryData = (clone $query)->get(['id', 'payment_deadline']);
                $now = now()->startOfDay();
                $threeDaysLater = now()->addDays(3)->endOfDay();
                
                return [
                    'waiting_approval' => $summaryData->count(),
                    'nearing_deadline' => $summaryData->filter(function($pr) use ($now, $threeDaysLater) {
                        return $pr->payment_deadline >= $now && $pr->payment_deadline <= $threeDaysLater;
                    })->count(),
                    'overdue' => $summaryData->filter(function($pr) use ($now) {
                        return $pr->payment_deadline < $now;
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
            'recipient_name' => 'required|string',
            'project_or_outlet' => 'required|string',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();
            
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
                'recipient_name' => $request->recipient_name,
                'vendor_id' => $request->vendor_id,
                'invoice_reference' => $request->invoice_reference,
                'project_or_outlet' => $request->project_or_outlet,
                'payment_method' => $request->payment_method,
                'bank_or_wallet' => $request->bank_or_wallet,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'account_used_before' => $request->account_used_before ?? false,
                'account_changed' => $request->account_changed ?? false,
                'account_change_note' => $request->account_change_note,
                'vat_status' => $request->vat_status ?? 'Tidak Dikenakan',
                'vat_rate' => $request->vat_rate ?? 0,
                'workflow_status' => 'draft',
                'created_by' => $user->id,
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
                $file = $request->file('lampiran_foto');
                $path = $file->store('payment_requests', 'public');
                \Illuminate\Support\Facades\DB::table('payment_request_attachments')->insert([
                    'payment_request_id' => $paymentRequest->id,
                    'attachment_type' => 'Lampiran Foto',
                    'original_name' => $file->getClientOriginalName(),
                    'stored_name' => basename($path),
                    'file_path' => $path,
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
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
        if (!$user->hasRole('Superadmin') && !$user->hasPermissionTo('payment-request.view-all')) {
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

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && $user->hasRole('Manager')) {
            $canApprove = true;
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && $user->hasRole('General Accounting')) {
            $canApprove = true;
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_director' && $user->hasRole('Direktur')) {
            $canApprove = true;
            $canReject = true;
        } elseif ($user->hasRole('Superadmin') && in_array($paymentRequest->workflow_status, ['waiting_supervisor', 'waiting_ga', 'waiting_director'])) {
            $canApprove = true;
            $canReject = true;
        }

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => $paymentRequest,
            'completeness' => $completeness,
            'canApprove' => $canApprove,
            'canReject' => $canReject
        ]);
    }

    public function edit($id)
    {
        $paymentRequest = PaymentRequest::with(['items', 'requester', 'division'])->findOrFail($id);
        $user = Auth::user();

        // Only requester can edit their draft
        if ($paymentRequest->requester_id !== $user->id || $paymentRequest->workflow_status !== 'draft') {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengajuan ini.');
        }

        $vendors = Provider::where('status', 'Aktif')->get();
        $companies = \App\Models\Company::all();

        return Inertia::render('PaymentRequests/Edit', [
            'paymentRequest' => $paymentRequest,
            'vendors' => $vendors,
            'companies' => $companies,
        ]);
    }

    public function update(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        if ($paymentRequest->requester_id !== $user->id || $paymentRequest->workflow_status !== 'draft') {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengajuan ini.');
        }

        $request->validate([
            'company_name' => 'required|string',
            'payment_deadline' => 'required|date',
            'transaction_date' => 'required|date',
            'category' => 'required|string',
            'purpose' => 'required|string',
            'recipient_name' => 'required|string',
            'project_or_outlet' => 'required|string',
            'payment_method' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();
            
            $paymentRequest->update([
                'company_name' => $request->company_name,
                'payment_deadline' => $request->payment_deadline,
                'transaction_date' => $request->transaction_date,
                'category' => $request->category,
                'purpose' => $request->purpose,
                'recipient_name' => $request->recipient_name,
                'vendor_id' => $request->vendor_id,
                'invoice_reference' => $request->invoice_reference,
                'project_or_outlet' => $request->project_or_outlet,
                
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

            if ($request->hasFile('lampiran_foto')) {
                $file = $request->file('lampiran_foto');
                $path = $file->store('payment_requests', 'public');
                
                $oldAttachment = \Illuminate\Support\Facades\DB::table('payment_request_attachments')
                    ->where('payment_request_id', $paymentRequest->id)
                    ->where('attachment_type', 'Lampiran Foto')
                    ->first();
                    
                if ($oldAttachment) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldAttachment->file_path);
                    \Illuminate\Support\Facades\DB::table('payment_request_attachments')
                        ->where('id', $oldAttachment->id)
                        ->update([
                            'original_name' => $file->getClientOriginalName(),
                            'stored_name' => basename($path),
                            'file_path' => $path,
                            'mime_type' => $file->getClientMimeType(),
                            'file_size' => $file->getSize(),
                            'uploaded_by' => $user->id,
                            'updated_at' => now(),
                        ]);
                } else {
                    \Illuminate\Support\Facades\DB::table('payment_request_attachments')->insert([
                        'payment_request_id' => $paymentRequest->id,
                        'attachment_type' => 'Lampiran Foto',
                        'original_name' => $file->getClientOriginalName(),
                        'stored_name' => basename($path),
                        'file_path' => $path,
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                        'uploaded_by' => $user->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

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
            'workflow_status' => 'waiting_supervisor',
            'submission_date' => now(),
            'submitted_at' => now(),
        ]);

        return redirect()->route('payment-requests.show', $paymentRequest->id)
                         ->with('success', 'Pengajuan berhasil dikirim dan sedang menunggu persetujuan Supervisor.');
    }

    public function approve(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);
        $user = Auth::user();

        $canApprove = false;
        $nextStatus = '';
        $approvedField = '';

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && $user->hasRole('Manager')) {
            $canApprove = true;
            $nextStatus = 'waiting_ga';
            $approvedField = 'supervisor_approved_at';
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && $user->hasRole('General Accounting')) {
            $canApprove = true;
            $nextStatus = 'waiting_director';
            $approvedField = 'finance_verified_at';
        } elseif ($paymentRequest->workflow_status === 'waiting_director' && $user->hasRole('Direktur')) {
            $canApprove = true;
            $nextStatus = 'approved';
            $approvedField = 'approved_for_payment_at';
        } elseif ($user->hasRole('Superadmin')) {
            $canApprove = true;
            if ($paymentRequest->workflow_status === 'waiting_supervisor') {
                $nextStatus = 'waiting_ga';
                $approvedField = 'supervisor_approved_at';
            } elseif ($paymentRequest->workflow_status === 'waiting_ga') {
                $nextStatus = 'waiting_director';
                $approvedField = 'finance_verified_at';
            } elseif ($paymentRequest->workflow_status === 'waiting_director') {
                $nextStatus = 'approved';
                $approvedField = 'approved_for_payment_at';
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

        if ($paymentRequest->workflow_status === 'waiting_supervisor' && $user->hasRole('Manager')) {
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_ga' && $user->hasRole('General Accounting')) {
            $canReject = true;
        } elseif ($paymentRequest->workflow_status === 'waiting_director' && $user->hasRole('Direktur')) {
            $canReject = true;
        } elseif ($user->hasRole('Superadmin')) {
            $canReject = in_array($paymentRequest->workflow_status, ['waiting_supervisor', 'waiting_ga', 'waiting_director']);
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

    public function downloadPdf(PaymentRequest $paymentRequest)
    {
        $user = Auth::user();
        
        // Basic authorization check
        $canView = false;
        if ($user->hasRole('Superadmin') || $user->hasPermissionTo('payment-request.view-all')) {
            $canView = true;
        } elseif ($user->hasPermissionTo('payment-request.view-division') && $paymentRequest->division_id == $user->division_id) {
            $canView = true;
        } elseif ($paymentRequest->requester_id == $user->id) {
            $canView = true;
        } elseif ($user->hasRole('Manager') || $user->hasRole('General Accounting') || $user->hasRole('Direktur')) {
            // Approvers can view
            $canView = true;
        }

        if (!$canView) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat pengajuan ini.');
        }

        $paymentRequest->load(['requester', 'division', 'vendor', 'items', 'approvals.approver']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.payment_request', [
            'paymentRequest' => $paymentRequest
        ]);

        $filename = 'Pengajuan_Pembayaran_' . str_replace(['/', '\\'], '-', $paymentRequest->reference_number) . '.pdf';
        return $pdf->download($filename);
    }
}
