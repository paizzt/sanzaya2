<?php

namespace App\Services;

use App\Models\PaymentRequest;
use App\Models\PaymentApprovalThreshold;
use App\Models\Division;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentRequestService
{
    /**
     * Generate unique reference number
     */
    public function generateReferenceNumber($divisionId, $date = null)
    {
        $date = $date ? Carbon::parse($date) : now();
        $year = $date->format('Y');
        $month = $date->format('m');
        
        $division = Division::find($divisionId);
        
        // Define division code
        $divisionCodes = [
            'Purchasing' => 'PUR',
            'Marketing' => 'MKT',
            'HRGA' => 'HRG',
            'Admin Fakturis' => 'FAK',
            'Tax' => 'TAX',
            'PJT' => 'PJT',
            'Interior' => 'INT',
        ];
        
        $code = $divisionCodes[$division->name] ?? 'DIV';

        return DB::transaction(function () use ($code, $year, $month) {
            $prefix = "PAY/{$code}/{$year}/{$month}/";
            
            $lastRequest = PaymentRequest::where('reference_number', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderBy('reference_number', 'desc')
                ->first();
                
            $sequence = 1;
            if ($lastRequest) {
                $lastSequence = (int) substr($lastRequest->reference_number, -4);
                $sequence = $lastSequence + 1;
            }
            
            return $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Determine approval route based on grand total
     */
    public function determineApprovalRoute($grandTotal)
    {
        // For a new request, the next stage after 'submitted' is 'waiting_supervisor'.
        // This function determines the MAX required stage.
        $thresholds = PaymentApprovalThreshold::where('is_active', true)
            ->where(function($q) use ($grandTotal) {
                $q->whereNull('maximum_amount')
                  ->orWhere('maximum_amount', '>=', $grandTotal);
            })
            ->where('minimum_amount', '<=', $grandTotal)
            ->orderBy('approval_order', 'desc') // Get the highest required approval
            ->first();
            
        return $thresholds;
    }

    /**
     * Calculate Totals
     */
    public function calculateTotals($items, $discount = 0, $otherCost = 0, $vatStatus = 'Tidak Dikenakan', $vatRate = 0)
    {
        $subtotal = collect($items)->sum(function ($item) {
            return $item['quantity'] * $item['unit_price'];
        });

        $vatAmount = 0;
        
        if ($vatStatus === 'Belum Termasuk' && $vatRate > 0) {
            $vatAmount = $subtotal * ($vatRate / 100);
        }

        $grandTotal = $subtotal - $discount + $otherCost + $vatAmount;

        return [
            'subtotal' => $subtotal,
            'vat_amount' => $vatAmount,
            'grand_total' => $grandTotal
        ];
    }
    
    /**
     * Check Completeness
     */
    public function checkCompleteness(PaymentRequest $request)
    {
        $missing = [];
        
        if (empty($request->company_name)) $missing[] = 'Nama perusahaan';
        if (empty($request->requester_id)) $missing[] = 'Nama pengaju';
        if (empty($request->division_id)) $missing[] = 'Divisi';
        if (empty($request->payment_deadline)) $missing[] = 'Batas akhir pembayaran';
        if (empty($request->transaction_date)) $missing[] = 'Tanggal transaksi';
        if (empty($request->category)) $missing[] = 'Kategori';
        if (empty($request->purpose)) $missing[] = 'Perihal atau tujuan';
        if (empty($request->recipient_name)) $missing[] = 'Nama penerima';
        if (empty($request->project_or_outlet)) $missing[] = 'Outlet, instansi, proyek, atau keterangan';
        
        if ($request->items()->count() == 0) $missing[] = 'Minimal satu rincian anggaran';
        if ($request->grand_total <= 0) $missing[] = 'Total pembayaran harus lebih besar dari nol';
        
        if (empty($request->vat_status)) $missing[] = 'Status PPN';
        if (empty($request->payment_method)) $missing[] = 'Metode pembayaran';
        
        if ($request->payment_method !== 'Tunai') {
            if (empty($request->bank_or_wallet)) $missing[] = 'Bank atau E-Wallet';
            if (empty($request->account_number)) $missing[] = 'Nomor rekening atau QRIS';
            if (empty($request->account_name)) $missing[] = 'Atas nama rekening';
        }
        
        // Temporarily disabled attachment checks since UI is not ready yet
        // $hasInvoice = $request->attachments()->where('attachment_type', 'Invoice/Quotation')->exists();
        // if (!$hasInvoice) $missing[] = 'Invoice, quotation, atau nota';
        
        // if ($request->payment_method !== 'Tunai') {
        //     $hasRekening = $request->attachments()->where('attachment_type', 'Bukti Rekening')->exists();
        //     if (!$hasRekening) $missing[] = 'Bukti rekening atau QRIS';
        // }
        
        // if (in_array($request->vat_status, ['Sudah Termasuk', 'Belum Termasuk'])) {
        //     $hasTax = $request->attachments()->where('attachment_type', 'Dokumen Pajak')->exists();
        //     if (!$hasTax) $missing[] = 'Dokumen pajak wajib disertakan';
        // }
        
        if ($request->account_changed && empty($request->account_change_note)) {
            $missing[] = 'Catatan perubahan rekening';
        }

        $isComplete = count($missing) === 0;
        
        // Always save to database to reflect the latest status
        $request->update([
            'completeness_status' => $isComplete ? 'complete' : 'incomplete'
        ]);

        return [
            'is_complete' => $isComplete,
            'missing' => $missing
        ];
    }
}
