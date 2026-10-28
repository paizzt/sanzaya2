<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Payroll extends Model
{
    use HasFactory, LogsActivity;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'period_month' => 'integer',
            'period_year' => 'integer',
            'payment_date' => 'date',
            'gaji_pokok' => 'float',
            'operasional' => 'float',
            'tunjangan_jabatan' => 'float',
            'thr' => 'float',
            'lembur' => 'float',
            'total_penerimaan' => 'float',
            'bpjs_kesehatan_persen' => 'float',
            'bpjs_kesehatan' => 'float',
            'bpjs_ketenagakerjaan_persen' => 'float',
            'bpjs_ketenagakerjaan' => 'float',
            'pajak' => 'float',
            'piutang' => 'float',
            'potongan_absen' => 'float',
            'potongan_lainnya' => 'float',
            'total_potongan' => 'float',
            'bpjs_kesehatan_perusahaan_persen' => 'float',
            'bpjs_kesehatan_perusahaan' => 'float',
            'bpjs_ketenagakerjaan_perusahaan_persen' => 'float',
            'bpjs_ketenagakerjaan_perusahaan' => 'float',
            'total_bpjs_perusahaan' => 'float',
            'total_diterima' => 'float',
        ];
    }

    protected static function booted()
    {
        static::saving(function ($payroll) {
            $payroll->recalculate();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Recalculate totals automatically
     */
    public function recalculate(): void
    {
        // 1. Total Penerimaan
        $this->total_penerimaan = (float)$this->gaji_pokok 
            + (float)$this->operasional 
            + (float)$this->tunjangan_jabatan 
            + (float)$this->thr 
            + (float)$this->lembur;

        $bpjsBase = (float)$this->gaji_pokok;

        // 2. BPJS Karyawan
        if (($this->bpjs_kesehatan_persen ?? 0) > 0 && empty($this->bpjs_kesehatan)) {
            $this->bpjs_kesehatan = round(($bpjsBase * (float)$this->bpjs_kesehatan_persen) / 100);
        }
        if (($this->bpjs_ketenagakerjaan_persen ?? 0) > 0 && empty($this->bpjs_ketenagakerjaan)) {
            $this->bpjs_ketenagakerjaan = round(($bpjsBase * (float)$this->bpjs_ketenagakerjaan_persen) / 100);
        }

        // 3. BPJS Perusahaan
        if (($this->bpjs_kesehatan_perusahaan_persen ?? 0) > 0 && empty($this->bpjs_kesehatan_perusahaan)) {
            $this->bpjs_kesehatan_perusahaan = round(($bpjsBase * (float)$this->bpjs_kesehatan_perusahaan_persen) / 100);
        }
        if (($this->bpjs_ketenagakerjaan_perusahaan_persen ?? 0) > 0 && empty($this->bpjs_ketenagakerjaan_perusahaan)) {
            $this->bpjs_ketenagakerjaan_perusahaan = round(($bpjsBase * (float)$this->bpjs_ketenagakerjaan_perusahaan_persen) / 100);
        }

        $this->total_bpjs_perusahaan = (float)$this->bpjs_kesehatan_perusahaan + (float)$this->bpjs_ketenagakerjaan_perusahaan;

        // 4. Total Potongan
        $this->total_potongan = (float)$this->bpjs_kesehatan 
            + (float)$this->bpjs_ketenagakerjaan 
            + (float)$this->pajak 
            + (float)$this->piutang 
            + (float)$this->potongan_absen 
            + (float)$this->potongan_lainnya;

        // 5. Total Diterima (Take Home Pay)
        $this->total_diterima = max(0, $this->total_penerimaan - $this->total_potongan);
    }

    /**
     * Helper to convert numbers to Indonesian words
     */
    public static function terbilang($number): string
    {
        $number = abs((float)$number);
        $huruf = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
        $temp = '';
        
        if ($number < 12) {
            $temp = ' ' . $huruf[(int)$number];
        } else if ($number < 20) {
            $temp = self::terbilang($number - 10) . ' Belas';
        } else if ($number < 100) {
            $temp = self::terbilang((int)($number / 10)) . ' Puluh' . self::terbilang($number % 10);
        } else if ($number < 200) {
            $temp = ' Seratus' . self::terbilang($number - 100);
        } else if ($number < 1000) {
            $temp = self::terbilang((int)($number / 100)) . ' Ratus' . self::terbilang($number % 100);
        } else if ($number < 2000) {
            $temp = ' Seribu' . self::terbilang($number - 1000);
        } else if ($number < 1000000) {
            $temp = self::terbilang((int)($number / 1000)) . ' Ribu' . self::terbilang(fmod($number, 1000));
        } else if ($number < 1000000000) {
            $temp = self::terbilang((int)($number / 1000000)) . ' Juta' . self::terbilang(fmod($number, 1000000));
        } else if ($number < 1000000000000) {
            $temp = self::terbilang((int)($number / 1000000000)) . ' Miliar' . self::terbilang(fmod($number, 1000000000));
        } else if ($number < 1000000000000000) {
            $temp = self::terbilang((int)($number / 1000000000000)) . ' Triliun' . self::terbilang(fmod($number, 1000000000000));
        }
        return trim($temp);
    }

    public function getTerbilangAttribute(): string
    {
        $words = self::terbilang($this->total_diterima);
        return $words ? $words . ' Rupiah' : 'Nol Rupiah';
    }

    public function getMonthNameAttribute(): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        return $months[$this->period_month] ?? (string)$this->period_month;
    }

    public function getPeriodFormattedAttribute(): string
    {
        return $this->month_name . ' ' . $this->period_year;
    }
}
