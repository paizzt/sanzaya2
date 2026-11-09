<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\Company;
use App\Models\Division;
use App\Models\Attendance;
use App\Models\AttendanceRequest;
use App\Models\FeatureToggle;
use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayrollController extends Controller
{
    /**
     * Ensure database table, custom columns, settings table, and feature toggles exist (self-healing for shared hosting)
     */
    public static function ensurePayrollTablesStatic(): void
    {
        try {
            if (!Schema::hasTable('payrolls')) {
                Artisan::call('migrate', ['--force' => true]);
            }

            if (Schema::hasTable('payrolls')) {
                Schema::table('payrolls', function ($table) {
                    if (!Schema::hasColumn('payrolls', 'jumlah_terlambat')) {
                        $table->integer('jumlah_terlambat')->default(0)->after('potongan_absen');
                    }
                    if (!Schema::hasColumn('payrolls', 'tarif_potongan_terlambat')) {
                        $table->decimal('tarif_potongan_terlambat', 15, 2)->default(20000)->after('jumlah_terlambat');
                    }
                    if (!Schema::hasColumn('payrolls', 'jumlah_lembur_weekday_pertama')) {
                        $table->integer('jumlah_lembur_weekday_pertama')->default(0)->after('lembur');
                    }
                    if (!Schema::hasColumn('payrolls', 'tarif_lembur_weekday_pertama')) {
                        $table->decimal('tarif_lembur_weekday_pertama', 15, 2)->default(30000)->after('jumlah_lembur_weekday_pertama');
                    }
                    if (!Schema::hasColumn('payrolls', 'jumlah_jam_lembur_weekday_berikutnya')) {
                        $table->integer('jumlah_jam_lembur_weekday_berikutnya')->default(0)->after('tarif_lembur_weekday_pertama');
                    }
                    if (!Schema::hasColumn('payrolls', 'tarif_lembur_weekday_berikutnya')) {
                        $table->decimal('tarif_lembur_weekday_berikutnya', 15, 2)->default(20000)->after('jumlah_jam_lembur_weekday_berikutnya');
                    }
                    if (!Schema::hasColumn('payrolls', 'jumlah_jam_lembur_sabtu')) {
                        $table->integer('jumlah_jam_lembur_sabtu')->default(0)->after('tarif_lembur_weekday_berikutnya');
                    }
                    if (!Schema::hasColumn('payrolls', 'tarif_lembur_sabtu')) {
                        $table->decimal('tarif_lembur_sabtu', 15, 2)->default(20000)->after('jumlah_jam_lembur_sabtu');
                    }
                });
            }

            if (!Schema::hasTable('payroll_settings')) {
                Schema::create('payroll_settings', function ($table) {
                    $table->id();
                    $table->decimal('tarif_potongan_terlambat', 15, 2)->default(20000);
                    $table->decimal('tarif_lembur_weekday_pertama', 15, 2)->default(30000);
                    $table->decimal('tarif_lembur_weekday_berikutnya', 15, 2)->default(20000);
                    $table->decimal('tarif_lembur_sabtu', 15, 2)->default(20000);
                    $table->string('jam_pulang_otomatis', 10)->default('17:00');
                    $table->string('jam_pulang_otomatis_sabtu', 10)->default('13:00');
                    $table->string('jam_mulai_lembur_weekday', 10)->default('20:00');
                    $table->string('jam_mulai_lembur_sabtu', 10)->default('14:00');
                    $table->string('jam_batas_terlambat', 10)->default('08:15');
                    $table->decimal('toleransi_terlambat_lembur_jam', 5, 2)->default(1);
                    $table->timestamps();
                });
            } else {
                Schema::table('payroll_settings', function ($table) {
                    if (!Schema::hasColumn('payroll_settings', 'jam_pulang_otomatis')) {
                        $table->string('jam_pulang_otomatis', 10)->default('17:00')->after('tarif_lembur_sabtu');
                    }
                    if (!Schema::hasColumn('payroll_settings', 'jam_pulang_otomatis_sabtu')) {
                        $table->string('jam_pulang_otomatis_sabtu', 10)->default('13:00')->after('jam_pulang_otomatis');
                    }
                    if (!Schema::hasColumn('payroll_settings', 'jam_mulai_lembur_weekday')) {
                        $table->string('jam_mulai_lembur_weekday', 10)->default('20:00')->after('jam_pulang_otomatis_sabtu');
                    }
                    if (!Schema::hasColumn('payroll_settings', 'jam_mulai_lembur_sabtu')) {
                        $table->string('jam_mulai_lembur_sabtu', 10)->default('14:00')->after('jam_mulai_lembur_weekday');
                    }
                    if (!Schema::hasColumn('payroll_settings', 'jam_batas_terlambat')) {
                        $table->string('jam_batas_terlambat', 10)->default('08:15')->after('jam_mulai_lembur_sabtu');
                    }
                    if (!Schema::hasColumn('payroll_settings', 'toleransi_terlambat_lembur_jam')) {
                        $table->decimal('toleransi_terlambat_lembur_jam', 5, 2)->default(1)->after('jam_batas_terlambat');
                    }
                });
            }

            if (Schema::hasTable('users')) {
                Schema::table('users', function ($table) {
                    if (!Schema::hasColumn('users', 'tanpa_keterlambatan')) {
                        $table->boolean('tanpa_keterlambatan')->default(false);
                    }
                    if (!Schema::hasColumn('users', 'tanpa_lembur')) {
                        $table->boolean('tanpa_lembur')->default(false);
                    }
                });
            }

            if (Schema::hasTable('attendances')) {
                Schema::table('attendances', function ($table) {
                    if (!Schema::hasColumn('attendances', 'overtime_status')) {
                        $table->string('overtime_status', 30)->nullable()->after('status');
                    }
                });
            }
        } catch (\Throwable $e) {}
    }

    protected function ensureTableAndFeatures(): void
    {
        self::ensurePayrollTablesStatic();

        try {
            FeatureToggle::firstOrCreate(['name' => 'Manajemen Gaji'], ['is_active' => true, 'disabled_for_users' => json_encode([])]);
            FeatureToggle::firstOrCreate(['name' => 'Slip Gaji'], ['is_active' => true, 'disabled_for_users' => json_encode([])]);
        } catch (\Throwable $e) {}
    }

    /**
     * Get global payroll settings (default rates for late deduction and overtime)
     */
    public static function getPayrollSettings(): array
    {
        $defaults = [
            'tarif_potongan_terlambat' => 20000.0,
            'tarif_lembur_weekday_pertama' => 30000.0,
            'tarif_lembur_weekday_berikutnya' => 20000.0,
            'tarif_lembur_sabtu' => 20000.0,
            'jam_pulang_otomatis' => '17:00',
            'jam_pulang_otomatis_sabtu' => '13:00',
            'jam_mulai_lembur_weekday' => '20:00',
            'jam_mulai_lembur_sabtu' => '14:00',
            'jam_batas_terlambat' => '08:15',
            'toleransi_terlambat_lembur_jam' => 1.0,
        ];

        try {
            self::ensurePayrollTablesStatic();
            if (Schema::hasTable('payroll_settings')) {
                $row = DB::table('payroll_settings')->first();
                if (!$row) {
                    DB::table('payroll_settings')->insert(array_merge($defaults, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                    return $defaults;
                }
                return [
                    'tarif_potongan_terlambat' => (float)($row->tarif_potongan_terlambat ?? 20000),
                    'tarif_lembur_weekday_pertama' => (float)($row->tarif_lembur_weekday_pertama ?? 30000),
                    'tarif_lembur_weekday_berikutnya' => (float)($row->tarif_lembur_weekday_berikutnya ?? 20000),
                    'tarif_lembur_sabtu' => (float)($row->tarif_lembur_sabtu ?? 20000),
                    'jam_pulang_otomatis' => substr((string)($row->jam_pulang_otomatis ?? '17:00'), 0, 5),
                    'jam_pulang_otomatis_sabtu' => substr((string)($row->jam_pulang_otomatis_sabtu ?? '13:00'), 0, 5),
                    'jam_mulai_lembur_weekday' => substr((string)($row->jam_mulai_lembur_weekday ?? '20:00'), 0, 5),
                    'jam_mulai_lembur_sabtu' => substr((string)($row->jam_mulai_lembur_sabtu ?? '14:00'), 0, 5),
                    'jam_batas_terlambat' => substr((string)($row->jam_batas_terlambat ?? '08:15'), 0, 5),
                    'toleransi_terlambat_lembur_jam' => (float)($row->toleransi_terlambat_lembur_jam ?? 1),
                ];
            }
        } catch (\Throwable $e) {}

        return $defaults;
    }

    /**
     * Calculate attendance, late count, and overtime hours/amounts directly from Rekap Absensi rules
     */
    public static function calculateAttendanceMetrics(User $user, int $month, int $year, array $customRates = []): array
    {
        $settings = self::getPayrollSettings();
        $tarifTerlambat = isset($customRates['tarif_potongan_terlambat']) ? (float)$customRates['tarif_potongan_terlambat'] : $settings['tarif_potongan_terlambat'];
        $tarifWeekdayPertama = isset($customRates['tarif_lembur_weekday_pertama']) ? (float)$customRates['tarif_lembur_weekday_pertama'] : $settings['tarif_lembur_weekday_pertama'];
        $tarifWeekdayBerikutnya = isset($customRates['tarif_lembur_weekday_berikutnya']) ? (float)$customRates['tarif_lembur_weekday_berikutnya'] : $settings['tarif_lembur_weekday_berikutnya'];
        $tarifSabtu = isset($customRates['tarif_lembur_sabtu']) ? (float)$customRates['tarif_lembur_sabtu'] : $settings['tarif_lembur_sabtu'];

        $jamMulaiWeekday = substr($settings['jam_mulai_lembur_weekday'] ?? '20:00', 0, 5) . ':00';
        $jamMulaiSabtu = substr($settings['jam_mulai_lembur_sabtu'] ?? '14:00', 0, 5) . ':00';
        $hourMulaiWeekday = (int)substr($jamMulaiWeekday, 0, 2);
        $hourMulaiSabtu = (int)substr($jamMulaiSabtu, 0, 2);

        $baseLateCarbon = Carbon::createFromFormat('H:i', substr($settings['jam_batas_terlambat'] ?? '08:15', 0, 5));
        $toleransiJam = (float)($settings['toleransi_terlambat_lembur_jam'] ?? 1);
        $normalLateThreshold = $baseLateCarbon->format('H:i') . ':00';
        $overtimeLateThreshold = $baseLateCarbon->copy()->addMinutes((int)round($toleransiJam * 60))->format('H:i:s');

        $isSatpam = $user->isSatpam();
        $tanpaKeterlambatan = (bool)($user->tanpa_keterlambatan ?? false);
        $tanpaLembur = (bool)($user->tanpa_lembur ?? false);
        $workDays = $user->work_days_per_week ?? 6;

        $attendances = Attendance::where('user_id', $user->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get();

        $attendanceRequests = AttendanceRequest::where('user_id', $user->id)
            ->where('status', '!=', 'Ditolak')
            ->where(function ($q) use ($month, $year) {
                $q->where(function ($q2) use ($month, $year) {
                    $q2->whereMonth('start_date', $month)->whereYear('start_date', $year);
                })->orWhere(function ($q2) use ($month, $year) {
                    $q2->whereMonth('end_date', $month)->whereYear('end_date', $year);
                });
            })
            ->get();

        // Build lemburMap starting 7 days prior to month start (for yesterday lembur check)
        $lemburMap = [];
        $startLimit = Carbon::create($year, $month, 1)->subDays(7);

        if (!$tanpaLembur) {
            $lemburAttendances = Attendance::where('user_id', $user->id)
                ->where(function ($q) {
                    $q->where('status', 'Lembur')->orWhere('overtime_status', 'Disetujui');
                })
                ->where('date', '>=', $startLimit->format('Y-m-d'))
                ->get();
            foreach ($lemburAttendances as $la) {
                $lemburMap[substr($la->date, 0, 10)] = true;
            }

            $lemburRequests = AttendanceRequest::where('user_id', $user->id)
                ->where('status', '!=', 'Ditolak')
                ->whereRaw('LOWER(type) = ?', ['lembur'])
                ->where('end_date', '>=', $startLimit->format('Y-m-d'))
                ->get();
            foreach ($lemburRequests as $lr) {
                $st = Carbon::parse($lr->start_date);
                $en = Carbon::parse($lr->end_date);
                while ($st->lte($en)) {
                    $lemburMap[$st->format('Y-m-d')] = true;
                    $st->addDay();
                }
            }
        }

        $hadir = 0;
        $sakit = 0;
        $izin = 0;
        $terlambat = 0;
        $lemburHari = 0;

        $jumlahWeekdayPertama = 0;
        $jumlahJamWeekdayBerikutnya = 0;
        $jumlahJamSabtu = 0;

        $lateDetails = [];
        $overtimeDetails = [];
        $lemburDatesCounted = [];

        foreach ($attendances as $att) {
            $dateStr = substr($att->date, 0, 10);
            $attDate = Carbon::parse($dateStr);
            $isSaturday = $attDate->dayOfWeek === Carbon::SATURDAY;
            $isSunday = $attDate->dayOfWeek === Carbon::SUNDAY;
            $isOffDay = ($isSunday || ($isSaturday && $workDays <= 5));

            // Parse checkout notes (matching AttendanceRecapController)
            $checkInNotes = $att->check_in_notes ?? null;
            $checkOutNotes = $att->check_out_notes ?? null;
            if (!$checkInNotes && !$checkOutNotes && !empty($att->notes)) {
                if (str_contains($att->notes, 'Masuk:') || str_contains($att->notes, 'Pulang:')) {
                    if (preg_match('/Pulang:\s*(.+)$/', $att->notes, $mOut)) {
                        $checkOutNotes = trim($mOut[1]);
                    }
                } else {
                    $checkOutNotes = $att->notes;
                }
            } elseif (!$checkOutNotes && !empty($att->notes)) {
                $checkOutNotes = $att->notes;
            }

            if ($att->status === 'Hadir') {
                $hadir++;

                if (!$isSatpam && !$tanpaKeterlambatan) {
                    // 1. Check Keterlambatan
                    $prevDateStr = $attDate->copy()->subDay()->format('Y-m-d');
                    $isLemburYesterday = !empty($lemburMap[$prevDateStr]);
                    $threshold = $isLemburYesterday ? $overtimeLateThreshold : $normalLateThreshold;

                    if ($att->check_in_time && $att->check_in_time > $threshold) {
                        $terlambat++;
                        $lateDetails[] = [
                            'date' => $dateStr,
                            'check_in' => substr($att->check_in_time, 0, 5),
                            'threshold' => substr($threshold, 0, 5),
                        ];
                    }
                }
            }

            // 2. Check Lembur (hanya dihitung jika overtime_status === 'Disetujui' atau status === 'Lembur')
            if (!$isSatpam && !$tanpaLembur) {
                $overtimeThreshold = $isOffDay ? '00:00:00' : (($isSaturday && $workDays >= 6) ? $jamMulaiSabtu : $jamMulaiWeekday);
                $hasOvertimeNotes = !empty(trim($checkOutNotes ?? '')) || (!empty(trim($att->notes ?? '')) && !str_starts_with($att->notes, 'Masuk:'));

                $isApprovedOvertime = false;
                if ($isOffDay) {
                    $isApprovedOvertime = ($att->check_out_time && $att->overtime_status === 'Disetujui');
                } else {
                    $isApprovedOvertime = ($att->check_out_time && $att->check_out_time >= $overtimeThreshold && $hasOvertimeNotes && $att->overtime_status === 'Disetujui');
                }
                $isLembur = ($isApprovedOvertime || ($att->status === 'Lembur' && $att->overtime_status !== 'Ditolak'));

                if ($isLembur) {
                    $lemburMap[$dateStr] = true;
                    $lemburDatesCounted[$dateStr] = true;
                    $lemburHari++;

                    // Determine checkout and checkin hour
                    $checkInHour = $att->check_in_time ? (int)substr($att->check_in_time, 0, 2) : 8;
                    $checkOutHour = $hourMulaiWeekday;
                    if ($att->check_out_time) {
                        $isCrossDay = ($att->check_in_time && $att->check_out_time < $att->check_in_time);
                        if ($isCrossDay || $att->check_out_time >= '23:55:00') {
                            $checkOutHour = 24;
                        } else {
                            $checkOutHour = (int)substr($att->check_out_time, 0, 2);
                        }
                    } else {
                        $checkOutHour = $isSaturday ? ($hourMulaiSabtu + 1) : $hourMulaiWeekday;
                    }

                    if ($isOffDay) {
                        // Masuk di hari libur (Sabtu bagi pekerja 5 hari, atau Minggu bagi semua): dihitung seluruh jam kerja
                        $offHours = max(1, min(24, $checkOutHour - $checkInHour));
                        $jumlahJamSabtu += $offHours;
                        $dayLabel = $isSunday ? 'Minggu (Hari Libur)' : 'Sabtu (Hari Libur / 5 Hari Kerja)';
                        $overtimeDetails[] = [
                            'date' => $dateStr,
                            'day_type' => $dayLabel,
                            'check_out' => $att->check_out_time ? ($att->check_out_time >= '23:55:00' ? '24:00' : substr($att->check_out_time, 0, 5)) : '17:00',
                            'jam_pertama' => 0,
                            'jam_berikutnya' => 0,
                            'jam_sabtu' => $offHours,
                            'nominal' => $offHours * $tarifSabtu,
                            'notes' => $checkOutNotes ?: ($att->notes ?? 'Masuk di hari libur'),
                        ];
                    } elseif ($isSaturday) {
                        // Sabtu (Pekerja 6 hari): dihitung mulai jam mulai lembur Sabtu
                        $satHours = max(1, min(24 - $hourMulaiSabtu, $checkOutHour - $hourMulaiSabtu));
                        $jumlahJamSabtu += $satHours;
                        $overtimeDetails[] = [
                            'date' => $dateStr,
                            'day_type' => 'Sabtu (Mulai ' . substr($jamMulaiSabtu, 0, 5) . ')',
                            'check_out' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : substr($jamMulaiSabtu, 0, 5),
                            'jam_pertama' => 0,
                            'jam_berikutnya' => 0,
                            'jam_sabtu' => $satHours,
                            'nominal' => $satHours * $tarifSabtu,
                            'notes' => $checkOutNotes ?: ($att->notes ?? '-'),
                        ];
                    } else {
                        // Senin - Jumat: jam pertama + jam berikutnya s/d jam 24:00
                        $extraHours = max(0, min(max(0, 24 - $hourMulaiWeekday), $checkOutHour - $hourMulaiWeekday));
                        $jumlahWeekdayPertama += 1;
                        $jumlahJamWeekdayBerikutnya += $extraHours;
                        $overtimeDetails[] = [
                            'date' => $dateStr,
                            'day_type' => 'Senin-Jumat',
                            'check_out' => $att->check_out_time ? ($att->check_out_time >= '23:55:00' ? '24:00' : substr($att->check_out_time, 0, 5)) : substr($jamMulaiWeekday, 0, 5),
                            'jam_pertama' => 1,
                            'jam_berikutnya' => $extraHours,
                            'jam_sabtu' => 0,
                            'nominal' => $tarifWeekdayPertama + ($extraHours * $tarifWeekdayBerikutnya),
                            'notes' => $checkOutNotes ?: ($att->notes ?? '-'),
                        ];
                    }
                }
            }
        }

        // Count Sakit, Izin, and Lembur from AttendanceRequest
        foreach ($attendanceRequests as $req) {
            $start = Carbon::parse($req->start_date);
            $end = Carbon::parse($req->end_date);
            $days = $start->diffInDays($end) + 1;
            $typeLower = strtolower($req->type);

            if ($typeLower === 'sakit') {
                $sakit += $days;
            } elseif ($typeLower === 'lembur') {
                if (!$isSatpam && !$tanpaLembur) {
                    $cur = $start->copy();
                    while ($cur->lte($end)) {
                        $dStr = $cur->format('Y-m-d');
                        if ((int)$cur->month === $month && (int)$cur->year === $year && empty($lemburDatesCounted[$dStr])) {
                            $lemburDatesCounted[$dStr] = true;
                            $lemburHari++;
                            $reqIsSunday = $cur->dayOfWeek === Carbon::SUNDAY;
                            $reqIsSaturday = $cur->dayOfWeek === Carbon::SATURDAY;
                            $reqIsOffDay = ($reqIsSunday || ($reqIsSaturday && $workDays <= 5));

                            if ($reqIsOffDay || $reqIsSaturday) {
                                $jumlahJamSabtu += 1;
                                $label = $reqIsSunday ? 'Minggu (Hari Libur / Pengajuan Lembur)' : ($reqIsSaturday && $workDays <= 5 ? 'Sabtu (Hari Libur / Pengajuan Lembur)' : 'Sabtu (Pengajuan Lembur)');
                                $overtimeDetails[] = [
                                    'date' => $dStr,
                                    'day_type' => $label,
                                    'check_out' => '-',
                                    'jam_pertama' => 0,
                                    'jam_berikutnya' => 0,
                                    'jam_sabtu' => 1,
                                    'nominal' => $tarifSabtu,
                                    'notes' => $req->reason ?? 'Pengajuan Lembur',
                                ];
                            } else {
                                $jumlahWeekdayPertama += 1;
                                $overtimeDetails[] = [
                                    'date' => $dStr,
                                    'day_type' => 'Senin-Jumat (Pengajuan Lembur)',
                                    'check_out' => '20:00',
                                    'jam_pertama' => 1,
                                    'jam_berikutnya' => 0,
                                    'jam_sabtu' => 0,
                                    'nominal' => $tarifWeekdayPertama,
                                    'notes' => $req->reason ?? 'Pengajuan Lembur',
                                ];
                            }
                        }
                        $cur->addDay();
                    }
                }
            } else {
                $izin += $days;
            }
        }

        // Calculate Alpa
        $alpa = 0;
        if (!$isSatpam) {
            $startOfMonth = Carbon::create($year, $month, 1);
            $endOfMonth = $startOfMonth->copy()->endOfMonth();
            $expectedDays = 0;
            $tempDate = $startOfMonth->copy();
            while ($tempDate->lte($endOfMonth)) {
                if ($tempDate->isWeekday()) {
                    $expectedDays++;
                } elseif ($workDays == 6 && $tempDate->dayOfWeek === Carbon::SATURDAY) {
                    $expectedDays++;
                }
                $tempDate->addDay();
            }
            $alpa = max(0, $expectedDays - ($hadir + $sakit + $izin));
        }

        $nominalPotonganTerlambat = $terlambat * $tarifTerlambat;
        $nominalWeekdayPertama = $jumlahWeekdayPertama * $tarifWeekdayPertama;
        $nominalWeekdayBerikutnya = $jumlahJamWeekdayBerikutnya * $tarifWeekdayBerikutnya;
        $nominalSabtu = $jumlahJamSabtu * $tarifSabtu;
        $totalNominalLembur = $nominalWeekdayPertama + $nominalWeekdayBerikutnya + $nominalSabtu;

        return [
            'hadir' => $hadir,
            'terlambat' => $terlambat,
            'izin' => $izin,
            'sakit' => $sakit,
            'absen' => $alpa,
            'lembur_hari' => $lemburHari,
            'total' => $attendances->count(),
            'jumlah_terlambat' => $terlambat,
            'tarif_potongan_terlambat' => $tarifTerlambat,
            'nominal_potongan_terlambat' => $nominalPotonganTerlambat,
            'jumlah_lembur_weekday_pertama' => $jumlahWeekdayPertama,
            'tarif_lembur_weekday_pertama' => $tarifWeekdayPertama,
            'nominal_lembur_weekday_pertama' => $nominalWeekdayPertama,
            'jumlah_jam_lembur_weekday_berikutnya' => $jumlahJamWeekdayBerikutnya,
            'tarif_lembur_weekday_berikutnya' => $tarifWeekdayBerikutnya,
            'nominal_lembur_weekday_berikutnya' => $nominalWeekdayBerikutnya,
            'jumlah_jam_lembur_sabtu' => $jumlahJamSabtu,
            'tarif_lembur_sabtu' => $tarifSabtu,
            'nominal_lembur_sabtu' => $nominalSabtu,
            'total_nominal_lembur' => $totalNominalLembur,
            'late_details' => $lateDetails,
            'overtime_details' => $overtimeDetails,
        ];
    }

    /**
     * Automatically sync an existing Payroll record when attendance in Rekap Absensi changes
     */
    public static function syncUserPayrollFromAttendance(int $userId, int $month, int $year): void
    {
        try {
            self::ensurePayrollTablesStatic();
            $payroll = Payroll::where('user_id', $userId)
                ->where('period_month', $month)
                ->where('period_year', $year)
                ->first();

            if (!$payroll) {
                return;
            }

            $user = User::find($userId);
            if (!$user) {
                return;
            }

            $settings = self::getPayrollSettings();
            $customRates = [
                'tarif_potongan_terlambat' => $payroll->tarif_potongan_terlambat > 0 ? $payroll->tarif_potongan_terlambat : $settings['tarif_potongan_terlambat'],
                'tarif_lembur_weekday_pertama' => $payroll->tarif_lembur_weekday_pertama > 0 ? $payroll->tarif_lembur_weekday_pertama : $settings['tarif_lembur_weekday_pertama'],
                'tarif_lembur_weekday_berikutnya' => $payroll->tarif_lembur_weekday_berikutnya > 0 ? $payroll->tarif_lembur_weekday_berikutnya : $settings['tarif_lembur_weekday_berikutnya'],
                'tarif_lembur_sabtu' => $payroll->tarif_lembur_sabtu > 0 ? $payroll->tarif_lembur_sabtu : $settings['tarif_lembur_sabtu'],
            ];

            $metrics = self::calculateAttendanceMetrics($user, $month, $year, $customRates);

            $payroll->jumlah_terlambat = $metrics['jumlah_terlambat'];
            $payroll->tarif_potongan_terlambat = $metrics['tarif_potongan_terlambat'];
            $payroll->potongan_absen = $metrics['nominal_potongan_terlambat'];

            $payroll->jumlah_lembur_weekday_pertama = $metrics['jumlah_lembur_weekday_pertama'];
            $payroll->tarif_lembur_weekday_pertama = $metrics['tarif_lembur_weekday_pertama'];
            $payroll->jumlah_jam_lembur_weekday_berikutnya = $metrics['jumlah_jam_lembur_weekday_berikutnya'];
            $payroll->tarif_lembur_weekday_berikutnya = $metrics['tarif_lembur_weekday_berikutnya'];
            $payroll->jumlah_jam_lembur_sabtu = $metrics['jumlah_jam_lembur_sabtu'];
            $payroll->tarif_lembur_sabtu = $metrics['tarif_lembur_sabtu'];
            $payroll->lembur = $metrics['total_nominal_lembur'];

            $payroll->recalculate();
            $payroll->save();
        } catch (\Throwable $e) {}
    }

    /**
     * Update global overtime & late deduction tariff settings, and optionally sync current period payrolls from Rekap Absensi
     */
    public function updateSettings(Request $request)
    {
        $this->ensureTableAndFeatures();

        $request->validate([
            'tarif_potongan_terlambat' => 'required|numeric|min:0',
            'tarif_lembur_weekday_pertama' => 'required|numeric|min:0',
            'tarif_lembur_weekday_berikutnya' => 'required|numeric|min:0',
            'tarif_lembur_sabtu' => 'required|numeric|min:0',
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020|max:2050',
            'sync_existing' => 'nullable|boolean',
        ]);

        $newSettings = [
            'tarif_potongan_terlambat' => (float)$request->tarif_potongan_terlambat,
            'tarif_lembur_weekday_pertama' => (float)$request->tarif_lembur_weekday_pertama,
            'tarif_lembur_weekday_berikutnya' => (float)$request->tarif_lembur_weekday_berikutnya,
            'tarif_lembur_sabtu' => (float)$request->tarif_lembur_sabtu,
            'updated_at' => now(),
        ];

        $existing = DB::table('payroll_settings')->first();
        if ($existing) {
            DB::table('payroll_settings')->where('id', $existing->id)->update($newSettings);
        } else {
            $newSettings['created_at'] = now();
            DB::table('payroll_settings')->insert($newSettings);
        }

        $syncedCount = 0;
        if ($request->boolean('sync_existing', true)) {
            $month = (int)$request->input('month', date('n'));
            $year = (int)$request->input('year', date('Y'));

            $payrolls = Payroll::with('user')
                ->where('period_month', $month)
                ->where('period_year', $year)
                ->get();

            foreach ($payrolls as $payroll) {
                if (!$payroll->user) continue;

                $metrics = self::calculateAttendanceMetrics($payroll->user, $month, $year, $newSettings);

                $payroll->jumlah_terlambat = $metrics['jumlah_terlambat'];
                $payroll->tarif_potongan_terlambat = $newSettings['tarif_potongan_terlambat'];
                $payroll->potongan_absen = $metrics['nominal_potongan_terlambat'];

                $payroll->jumlah_lembur_weekday_pertama = $metrics['jumlah_lembur_weekday_pertama'];
                $payroll->tarif_lembur_weekday_pertama = $newSettings['tarif_lembur_weekday_pertama'];
                $payroll->jumlah_jam_lembur_weekday_berikutnya = $metrics['jumlah_jam_lembur_weekday_berikutnya'];
                $payroll->tarif_lembur_weekday_berikutnya = $newSettings['tarif_lembur_weekday_berikutnya'];
                $payroll->jumlah_jam_lembur_sabtu = $metrics['jumlah_jam_lembur_sabtu'];
                $payroll->tarif_lembur_sabtu = $newSettings['tarif_lembur_sabtu'];
                $payroll->lembur = $metrics['total_nominal_lembur'];

                $payroll->recalculate();
                $payroll->save();
                $syncedCount++;
            }
        }

        return redirect()->back()->with('success', "Pengaturan tarif lembur & keterlambatan berhasil disimpan" . ($syncedCount > 0 ? " dan {$syncedCount} data gaji periode ini telah disinkronkan dengan Rekap Absensi." : "."));
    }

    /**
     * List all payroll records for HR / Management
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if ($user && !$user->isSuperAdminUser() && !$user->isAdminUser() && !\App\Models\FeatureToggle::userHasFeature($user, 'Manajemen Gaji')) {
            return redirect()->route('dashboard')->with('error', 'Akses ditolak: Fitur Manajemen Gaji dinonaktifkan untuk akun Anda.');
        }

        $this->ensureTableAndFeatures();

        $curMonth = (int)$request->input('month', date('n'));
        $curYear = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');
        $divisionId = $request->input('division_id');
        $search = $request->input('search');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        // Query payrolls
        $query = Payroll::with(['user.division', 'user.position', 'user.company', 'company'])
            ->where('period_month', $curMonth)
            ->where('period_year', $curYear);

        if ($allowedCompanyIds !== null) {
            $query->where(function ($q) use ($allowedCompanyIds) {
                $q->whereIn('company_id', $allowedCompanyIds)
                  ->orWhereHas('user', function ($uq) use ($allowedCompanyIds) {
                      $uq->whereIn('company_id', $allowedCompanyIds);
                  });
            });
        }

        if ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                  ->orWhereHas('user', function ($uq) use ($companyId) {
                      $uq->where('company_id', $companyId);
                  });
            });
        }

        if ($divisionId) {
            $query->whereHas('user', function ($q) use ($divisionId) {
                $q->where('division_id', $divisionId);
            });
        }

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        $payrolls = $query->orderBy('created_at', 'desc')->get();

        // Calculate summary
        $summary = [
            'total_karyawan' => $payrolls->count(),
            'total_penerimaan' => (float)$payrolls->sum('total_penerimaan'),
            'total_potongan' => (float)$payrolls->sum('total_potongan'),
            'total_bpjs_perusahaan' => (float)$payrolls->sum('total_bpjs_perusahaan'),
            'total_diterima' => (float)$payrolls->sum('total_diterima'),
        ];

        // Active users list for the "Add Payroll" form
        $userQuery = User::with(['division', 'position', 'company'])
            ->where('is_active', true);
        if ($allowedCompanyIds !== null) {
            $userQuery->whereIn('company_id', $allowedCompanyIds);
        }
        $users = $userQuery->orderBy('name')->get();

        $companies = Company::orderBy('name')->get();
        $divisions = Division::orderBy('name')->get();
        $payrollSettings = self::getPayrollSettings();

        return Inertia::render('Salaries/Index', [
            'payrolls' => $payrolls,
            'summary' => $summary,
            'users' => $users,
            'companies' => $companies,
            'divisions' => $divisions,
            'payrollSettings' => $payrollSettings,
            'filters' => [
                'month' => $curMonth,
                'year' => $curYear,
                'company_id' => $companyId ? (int)$companyId : null,
                'division_id' => $divisionId ? (int)$divisionId : null,
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Self-service payslips for logged-in employee
     */
    public function mySlip(Request $request)
    {
        $this->ensureTableAndFeatures();

        $user = auth()->user();
        $year = (int)$request->input('year', date('Y'));

        $slips = Payroll::with(['company', 'user.company', 'user.division', 'user.position'])
            ->where('user_id', $user->id)
            ->where('period_year', $year)
            ->orderBy('period_month', 'desc')
            ->get();

        return Inertia::render('Salaries/MySlip', [
            'slips' => $slips,
            'year' => $year,
            'user' => $user->load(['company', 'division', 'position']),
        ]);
    }

    /**
     * Get user details and attendance + overtime/late summary for a given month from Rekap Absensi
     */
    public function userSummary(Request $request)
    {
        $this->ensureTableAndFeatures();

        $userId = $request->input('user_id');
        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));

        if (!$userId) {
            return response()->json(['error' => 'User ID diperlukan'], 422);
        }

        $user = User::with(['division', 'position', 'company', 'roles'])->find($userId);
        if (!$user) {
            return response()->json(['error' => 'Pengguna tidak ditemukan'], 404);
        }

        $metrics = self::calculateAttendanceMetrics($user, $month, $year);

        return response()->json([
            'user' => $user,
            'attendance_count' => $metrics,
            'default_values' => [
                'gaji_pokok' => (float)($user->salary ?? 0),
                'operasional' => (float)($user->operational_allowance ?? 0),
                'bpjs_kesehatan_persen' => 1.0,
                'bpjs_ketenagakerjaan_persen' => 2.0,
                'bpjs_kesehatan_perusahaan_persen' => 4.0,
                'bpjs_ketenagakerjaan_perusahaan_persen' => 4.24,
                'jumlah_terlambat' => $metrics['jumlah_terlambat'],
                'tarif_potongan_terlambat' => $metrics['tarif_potongan_terlambat'],
                'potongan_absen' => $metrics['nominal_potongan_terlambat'],
                'jumlah_lembur_weekday_pertama' => $metrics['jumlah_lembur_weekday_pertama'],
                'tarif_lembur_weekday_pertama' => $metrics['tarif_lembur_weekday_pertama'],
                'jumlah_jam_lembur_weekday_berikutnya' => $metrics['jumlah_jam_lembur_weekday_berikutnya'],
                'tarif_lembur_weekday_berikutnya' => $metrics['tarif_lembur_weekday_berikutnya'],
                'jumlah_jam_lembur_sabtu' => $metrics['jumlah_jam_lembur_sabtu'],
                'tarif_lembur_sabtu' => $metrics['tarif_lembur_sabtu'],
                'lembur' => $metrics['total_nominal_lembur'],
            ]
        ]);
    }

    /**
     * Store new payroll record
     */
    public function store(Request $request)
    {
        $this->ensureTableAndFeatures();

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'period_month' => 'required|integer|between:1,12',
            'period_year' => 'required|integer|min:2020|max:2050',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|string|in:draft,published,paid',
            
            // Penerimaan
            'gaji_pokok' => 'nullable|numeric|min:0',
            'operasional' => 'nullable|numeric|min:0',
            'tunjangan_jabatan' => 'nullable|numeric|min:0',
            'thr' => 'nullable|numeric|min:0',
            'lembur' => 'nullable|numeric|min:0',

            // Custom Lembur & Keterlambatan
            'jumlah_terlambat' => 'nullable|integer|min:0',
            'tarif_potongan_terlambat' => 'nullable|numeric|min:0',
            'jumlah_lembur_weekday_pertama' => 'nullable|integer|min:0',
            'tarif_lembur_weekday_pertama' => 'nullable|numeric|min:0',
            'jumlah_jam_lembur_weekday_berikutnya' => 'nullable|integer|min:0',
            'tarif_lembur_weekday_berikutnya' => 'nullable|numeric|min:0',
            'jumlah_jam_lembur_sabtu' => 'nullable|integer|min:0',
            'tarif_lembur_sabtu' => 'nullable|numeric|min:0',

            // Potongan
            'bpjs_kesehatan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan' => 'nullable|numeric|min:0',
            'pajak' => 'nullable|numeric|min:0',
            'piutang' => 'nullable|numeric|min:0',
            'potongan_absen' => 'nullable|numeric|min:0',
            'potongan_lainnya' => 'nullable|numeric|min:0',

            // BPJS Perusahaan
            'bpjs_kesehatan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan_perusahaan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan_perusahaan' => 'nullable|numeric|min:0',

            'notes' => 'nullable|string',
        ]);

        $user = User::findOrFail($request->user_id);
        $settings = self::getPayrollSettings();

        // Check if payroll already exists for this period, update it if so
        $payroll = Payroll::firstOrNew([
            'user_id' => $request->user_id,
            'period_month' => (int)$request->period_month,
            'period_year' => (int)$request->period_year,
        ]);

        $payroll->company_id = $user->company_id;
        $payroll->payment_date = $request->payment_date ?: date('Y-m-d');
        $payroll->status = $request->status ?: 'published';
        $payroll->notes = $request->notes;
        $payroll->created_by = auth()->id();

        // Penerimaan
        $payroll->gaji_pokok = (float)($request->gaji_pokok ?? $user->salary ?? 0);
        $payroll->operasional = (float)($request->operasional ?? $user->operational_allowance ?? 0);
        $payroll->tunjangan_jabatan = (float)($request->tunjangan_jabatan ?? 0);
        $payroll->thr = (float)($request->thr ?? 0);
        $payroll->lembur = (float)($request->lembur ?? 0);

        // Custom Lembur & Keterlambatan
        $payroll->jumlah_terlambat = (int)($request->jumlah_terlambat ?? 0);
        $payroll->tarif_potongan_terlambat = (float)($request->tarif_potongan_terlambat ?? $settings['tarif_potongan_terlambat']);
        $payroll->jumlah_lembur_weekday_pertama = (int)($request->jumlah_lembur_weekday_pertama ?? 0);
        $payroll->tarif_lembur_weekday_pertama = (float)($request->tarif_lembur_weekday_pertama ?? $settings['tarif_lembur_weekday_pertama']);
        $payroll->jumlah_jam_lembur_weekday_berikutnya = (int)($request->jumlah_jam_lembur_weekday_berikutnya ?? 0);
        $payroll->tarif_lembur_weekday_berikutnya = (float)($request->tarif_lembur_weekday_berikutnya ?? $settings['tarif_lembur_weekday_berikutnya']);
        $payroll->jumlah_jam_lembur_sabtu = (int)($request->jumlah_jam_lembur_sabtu ?? 0);
        $payroll->tarif_lembur_sabtu = (float)($request->tarif_lembur_sabtu ?? $settings['tarif_lembur_sabtu']);

        // Potongan
        $payroll->bpjs_kesehatan_persen = (float)($request->bpjs_kesehatan_persen ?? 1.0);
        $payroll->bpjs_kesehatan = (float)($request->bpjs_kesehatan ?? 0);
        $payroll->bpjs_ketenagakerjaan_persen = (float)($request->bpjs_ketenagakerjaan_persen ?? 2.0);
        $payroll->bpjs_ketenagakerjaan = (float)($request->bpjs_ketenagakerjaan ?? 0);
        $payroll->pajak = (float)($request->pajak ?? 0);
        $payroll->piutang = (float)($request->piutang ?? 0);
        $payroll->potongan_absen = (float)($request->potongan_absen ?? 0);
        $payroll->potongan_lainnya = (float)($request->potongan_lainnya ?? 0);

        // BPJS Perusahaan
        $payroll->bpjs_kesehatan_perusahaan_persen = (float)($request->bpjs_kesehatan_perusahaan_persen ?? 4.0);
        $payroll->bpjs_kesehatan_perusahaan = (float)($request->bpjs_kesehatan_perusahaan ?? 0);
        $payroll->bpjs_ketenagakerjaan_perusahaan_persen = (float)($request->bpjs_ketenagakerjaan_perusahaan_persen ?? 4.24);
        $payroll->bpjs_ketenagakerjaan_perusahaan = (float)($request->bpjs_ketenagakerjaan_perusahaan ?? 0);

        $payroll->recalculate();
        $payroll->save();

        // Two-way sync: Sync gaji_pokok and operasional to User
        $userUpdated = false;
        if ($request->has('gaji_pokok') && (int)$user->salary !== (int)$payroll->gaji_pokok) {
            $user->salary = (int)$payroll->gaji_pokok;
            $userUpdated = true;
        }
        if ($request->has('operasional') && (int)$user->operational_allowance !== (int)$payroll->operasional) {
            $user->operational_allowance = (int)$payroll->operasional;
            $userUpdated = true;
        }
        if ($userUpdated) {
            $user->save();
        }

        return redirect()->back()->with('success', 'Data gaji berhasil disimpan dan data pengguna telah disinkronkan.');
    }

    /**
     * Update existing payroll record
     */
    public function update(Request $request, Payroll $payroll)
    {
        $this->ensureTableAndFeatures();

        $validated = $request->validate([
            'payment_date' => 'nullable|date',
            'status' => 'nullable|string|in:draft,published,paid',
            
            // Penerimaan
            'gaji_pokok' => 'nullable|numeric|min:0',
            'operasional' => 'nullable|numeric|min:0',
            'tunjangan_jabatan' => 'nullable|numeric|min:0',
            'thr' => 'nullable|numeric|min:0',
            'lembur' => 'nullable|numeric|min:0',

            // Custom Lembur & Keterlambatan
            'jumlah_terlambat' => 'nullable|integer|min:0',
            'tarif_potongan_terlambat' => 'nullable|numeric|min:0',
            'jumlah_lembur_weekday_pertama' => 'nullable|integer|min:0',
            'tarif_lembur_weekday_pertama' => 'nullable|numeric|min:0',
            'jumlah_jam_lembur_weekday_berikutnya' => 'nullable|integer|min:0',
            'tarif_lembur_weekday_berikutnya' => 'nullable|numeric|min:0',
            'jumlah_jam_lembur_sabtu' => 'nullable|integer|min:0',
            'tarif_lembur_sabtu' => 'nullable|numeric|min:0',

            // Potongan
            'bpjs_kesehatan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan' => 'nullable|numeric|min:0',
            'pajak' => 'nullable|numeric|min:0',
            'piutang' => 'nullable|numeric|min:0',
            'potongan_absen' => 'nullable|numeric|min:0',
            'potongan_lainnya' => 'nullable|numeric|min:0',

            // BPJS Perusahaan
            'bpjs_kesehatan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_kesehatan_perusahaan' => 'nullable|numeric|min:0',
            'bpjs_ketenagakerjaan_perusahaan_persen' => 'nullable|numeric|min:0|max:100',
            'bpjs_ketenagakerjaan_perusahaan' => 'nullable|numeric|min:0',

            'notes' => 'nullable|string',
        ]);

        if ($request->filled('payment_date')) $payroll->payment_date = $request->payment_date;
        if ($request->filled('status')) $payroll->status = $request->status;
        $payroll->notes = $request->notes;

        // Penerimaan
        if ($request->has('gaji_pokok')) $payroll->gaji_pokok = (float)$request->gaji_pokok;
        if ($request->has('operasional')) $payroll->operasional = (float)$request->operasional;
        if ($request->has('tunjangan_jabatan')) $payroll->tunjangan_jabatan = (float)$request->tunjangan_jabatan;
        if ($request->has('thr')) $payroll->thr = (float)$request->thr;
        if ($request->has('lembur')) $payroll->lembur = (float)$request->lembur;

        // Custom Lembur & Keterlambatan
        if ($request->has('jumlah_terlambat')) $payroll->jumlah_terlambat = (int)$request->jumlah_terlambat;
        if ($request->has('tarif_potongan_terlambat')) $payroll->tarif_potongan_terlambat = (float)$request->tarif_potongan_terlambat;
        if ($request->has('jumlah_lembur_weekday_pertama')) $payroll->jumlah_lembur_weekday_pertama = (int)$request->jumlah_lembur_weekday_pertama;
        if ($request->has('tarif_lembur_weekday_pertama')) $payroll->tarif_lembur_weekday_pertama = (float)$request->tarif_lembur_weekday_pertama;
        if ($request->has('jumlah_jam_lembur_weekday_berikutnya')) $payroll->jumlah_jam_lembur_weekday_berikutnya = (int)$request->jumlah_jam_lembur_weekday_berikutnya;
        if ($request->has('tarif_lembur_weekday_berikutnya')) $payroll->tarif_lembur_weekday_berikutnya = (float)$request->tarif_lembur_weekday_berikutnya;
        if ($request->has('jumlah_jam_lembur_sabtu')) $payroll->jumlah_jam_lembur_sabtu = (int)$request->jumlah_jam_lembur_sabtu;
        if ($request->has('tarif_lembur_sabtu')) $payroll->tarif_lembur_sabtu = (float)$request->tarif_lembur_sabtu;

        // Potongan
        if ($request->has('bpjs_kesehatan_persen')) $payroll->bpjs_kesehatan_persen = (float)$request->bpjs_kesehatan_persen;
        if ($request->has('bpjs_kesehatan')) $payroll->bpjs_kesehatan = (float)$request->bpjs_kesehatan;
        if ($request->has('bpjs_ketenagakerjaan_persen')) $payroll->bpjs_ketenagakerjaan_persen = (float)$request->bpjs_ketenagakerjaan_persen;
        if ($request->has('bpjs_ketenagakerjaan')) $payroll->bpjs_ketenagakerjaan = (float)$request->bpjs_ketenagakerjaan;
        if ($request->has('pajak')) $payroll->pajak = (float)$request->pajak;
        if ($request->has('piutang')) $payroll->piutang = (float)$request->piutang;
        if ($request->has('potongan_absen')) $payroll->potongan_absen = (float)$request->potongan_absen;
        if ($request->has('potongan_lainnya')) $payroll->potongan_lainnya = (float)$request->potongan_lainnya;

        // BPJS Perusahaan
        if ($request->has('bpjs_kesehatan_perusahaan_persen')) $payroll->bpjs_kesehatan_perusahaan_persen = (float)$request->bpjs_kesehatan_perusahaan_persen;
        if ($request->has('bpjs_kesehatan_perusahaan')) $payroll->bpjs_kesehatan_perusahaan = (float)$request->bpjs_kesehatan_perusahaan;
        if ($request->has('bpjs_ketenagakerjaan_perusahaan_persen')) $payroll->bpjs_ketenagakerjaan_perusahaan_persen = (float)$request->bpjs_ketenagakerjaan_perusahaan_persen;
        if ($request->has('bpjs_ketenagakerjaan_perusahaan')) $payroll->bpjs_ketenagakerjaan_perusahaan = (float)$request->bpjs_ketenagakerjaan_perusahaan;

        $payroll->recalculate();
        $payroll->save();

        // Two-way sync: Sync to User
        $user = $payroll->user;
        if ($user) {
            $userUpdated = false;
            if ($request->has('gaji_pokok') && (int)$user->salary !== (int)$payroll->gaji_pokok) {
                $user->salary = (int)$payroll->gaji_pokok;
                $userUpdated = true;
            }
            if ($request->has('operasional') && (int)$user->operational_allowance !== (int)$payroll->operasional) {
                $user->operational_allowance = (int)$payroll->operasional;
                $userUpdated = true;
            }
            if ($userUpdated) {
                $user->save();
            }
        }

        return redirect()->back()->with('success', 'Data gaji berhasil diperbarui dan disinkronkan.');
    }

    /**
     * Delete payroll record
     */
    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return redirect()->back()->with('success', 'Data gaji berhasil dihapus.');
    }

    /**
     * Batch generate payroll for all active employees for given month & year (automatically pulling lembur & keterlambatan from Rekap Absensi)
     */
    public function generate(Request $request)
    {
        $this->ensureTableAndFeatures();

        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        $userQuery = User::with('roles')->where('is_active', true);
        if ($allowedCompanyIds !== null) {
            $userQuery->whereIn('company_id', $allowedCompanyIds);
        }
        if ($companyId) {
            $userQuery->where('company_id', $companyId);
        }

        $users = $userQuery->get();
        $settings = self::getPayrollSettings();
        $countCreated = 0;
        $countUpdated = 0;

        foreach ($users as $user) {
            $payroll = Payroll::firstOrNew([
                'user_id' => $user->id,
                'period_month' => $month,
                'period_year' => $year,
            ]);

            $isNew = !$payroll->exists;

            $payroll->company_id = $user->company_id;
            $payroll->payment_date = date('Y-m-d');
            $payroll->status = 'published';
            $payroll->created_by = auth()->id();

            // Default salary components from user
            $payroll->gaji_pokok = (float)($user->salary ?? 0);
            $payroll->operasional = (float)($user->operational_allowance ?? 0);

            // Calculate attendance metrics (late & overtime) from Rekap Absensi
            $metrics = self::calculateAttendanceMetrics($user, $month, $year, $settings);

            $payroll->jumlah_terlambat = $metrics['jumlah_terlambat'];
            $payroll->tarif_potongan_terlambat = $metrics['tarif_potongan_terlambat'];
            $payroll->potongan_absen = $metrics['nominal_potongan_terlambat'];

            $payroll->jumlah_lembur_weekday_pertama = $metrics['jumlah_lembur_weekday_pertama'];
            $payroll->tarif_lembur_weekday_pertama = $metrics['tarif_lembur_weekday_pertama'];
            $payroll->jumlah_jam_lembur_weekday_berikutnya = $metrics['jumlah_jam_lembur_weekday_berikutnya'];
            $payroll->tarif_lembur_weekday_berikutnya = $metrics['tarif_lembur_weekday_berikutnya'];
            $payroll->jumlah_jam_lembur_sabtu = $metrics['jumlah_jam_lembur_sabtu'];
            $payroll->tarif_lembur_sabtu = $metrics['tarif_lembur_sabtu'];
            $payroll->lembur = $metrics['total_nominal_lembur'];

            // Default percentages
            $payroll->bpjs_kesehatan_persen = 1.0;
            $payroll->bpjs_ketenagakerjaan_persen = 2.0;
            $payroll->bpjs_kesehatan_perusahaan_persen = 4.0;
            $payroll->bpjs_ketenagakerjaan_perusahaan_persen = 4.24;

            // Compute BPJS amounts from base salary
            $bpjsBase = (float)$payroll->gaji_pokok;
            $payroll->bpjs_kesehatan = round(($bpjsBase * 1.0) / 100);
            $payroll->bpjs_ketenagakerjaan = round(($bpjsBase * 2.0) / 100);
            $payroll->bpjs_kesehatan_perusahaan = round(($bpjsBase * 4.0) / 100);
            $payroll->bpjs_ketenagakerjaan_perusahaan = round(($bpjsBase * 4.24) / 100);

            $payroll->recalculate();
            $payroll->save();

            if ($isNew) {
                $countCreated++;
            } else {
                $countUpdated++;
            }
        }

        return redirect()->back()->with('success', "Generate & sinkronisasi gaji dengan Rekap Absensi berhasil: {$countCreated} data baru dibuat, {$countUpdated} data diperbarui.");
    }

    /**
     * Download individual Slip Gaji PDF
     */
    public function slipPdf(Payroll $payroll)
    {
        // Authorization check: User can download their own slip, or user with view permission
        $currentUser = auth()->user();
        if ($payroll->user_id !== $currentUser->id && !$currentUser->isSuperAdminUser() && !$currentUser->isAdminUser() && !$currentUser->can('view users') && !$currentUser->can('view salaries') && !\App\Models\FeatureToggle::userHasFeature($currentUser, 'Manajemen Gaji')) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengunduh slip gaji ini.');
        }

        $payroll->load(['user.division', 'user.position', 'user.company', 'company']);
        $company = $payroll->company ?? $payroll->user->company ?? Company::first();

        // Convert company logo to base64 if present for clean DomPDF rendering
        $logoBase64 = null;
        if ($company && $company->logo) {
            $logoPath = storage_path('app/public/' . $company->logo);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $pdf = Pdf::loadView('pdf.slip_gaji', [
            'payroll' => $payroll,
            'company' => $company,
            'logoBase64' => $logoBase64,
            'terbilang' => $payroll->terbilang,
        ])->setPaper('a4', 'portrait');

        $filename = 'Slip_Gaji_' . str_replace(' ', '_', $payroll->user->name) . '_' . $payroll->month_name . '_' . $payroll->period_year . '.pdf';
        return $pdf->download($filename);
    }

    /**
     * Export recap PDF for a month
     */
    public function exportPdf(Request $request)
    {
        $this->ensureTableAndFeatures();

        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        $query = Payroll::with(['user.division', 'user.position', 'user.company', 'company'])
            ->where('period_month', $month)
            ->where('period_year', $year);

        if ($allowedCompanyIds !== null) {
            $query->where(function ($q) use ($allowedCompanyIds) {
                $q->whereIn('company_id', $allowedCompanyIds)
                  ->orWhereHas('user', function ($uq) use ($allowedCompanyIds) {
                      $uq->whereIn('company_id', $allowedCompanyIds);
                  });
            });
        }

        if ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                  ->orWhereHas('user', function ($uq) use ($companyId) {
                      $uq->where('company_id', $companyId);
                  });
            });
        }

        $payrolls = $query->orderBy('created_at', 'asc')->get();

        $company = $companyId ? Company::find($companyId) : (auth()->user()?->company ?? Company::first());

        $logoBase64 = null;
        if ($company && $company->logo) {
            $logoPath = storage_path('app/public/' . $company->logo);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $monthName = $months[$month] ?? (string)$month;

        $pdf = Pdf::loadView('pdf.payroll_recap', [
            'payrolls' => $payrolls,
            'monthName' => $monthName,
            'year' => $year,
            'company' => $company,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'landscape');

        return $pdf->download("Rekap_Gaji_{$monthName}_{$year}.pdf");
    }

    /**
     * Export recap Excel for a month
     */
    public function exportExcel(Request $request)
    {
        $this->ensureTableAndFeatures();

        $month = (int)$request->input('month', date('n'));
        $year = (int)$request->input('year', date('Y'));
        $companyId = $request->input('company_id');

        $allowedCompanyIds = auth()->user()?->getAllowedCompanyIds();

        $query = Payroll::with(['user.division', 'user.position', 'user.company', 'company'])
            ->where('period_month', $month)
            ->where('period_year', $year);

        if ($allowedCompanyIds !== null) {
            $query->where(function ($q) use ($allowedCompanyIds) {
                $q->whereIn('company_id', $allowedCompanyIds)
                  ->orWhereHas('user', function ($uq) use ($allowedCompanyIds) {
                      $uq->whereIn('company_id', $allowedCompanyIds);
                  });
            });
        }

        if ($companyId) {
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                  ->orWhereHas('user', function ($uq) use ($companyId) {
                      $uq->where('company_id', $companyId);
                  });
            });
        }

        $payrolls = $query->orderBy('created_at', 'asc')->get();

        $headings = [
            'No',
            'Nama Karyawan',
            'NIK / ID',
            'Perusahaan',
            'Divisi',
            'Jabatan',
            'Gaji Pokok',
            'Operasional',
            'Tunjangan Jabatan',
            'THR',
            'Lembur Sen-Jum Jam 20:00 (Kali)',
            'Lembur Sen-Jum Jam Berikutnya (Jam)',
            'Lembur Sabtu (Jam)',
            'Total Lembur (Rp)',
            'Total Penerimaan',
            'BPJS Kesehatan (Karyawan)',
            'BPJS TK (Karyawan)',
            'Pajak (PPh 21)',
            'Piutang',
            'Jumlah Terlambat (Kali)',
            'Potongan Terlambat / Operasional (Rp)',
            'Potongan Lainnya',
            'Total Potongan',
            'BPJS Kes (Perusahaan)',
            'BPJS TK (Perusahaan)',
            'Total BPJS Perusahaan',
            'Total Diterima (THP)',
            'Status',
        ];

        $rows = [];
        $no = 1;
        foreach ($payrolls as $p) {
            $rows[] = [
                $no++,
                $p->user->name ?? '-',
                $p->user->employee_id ?? $p->user->nik ?? '-',
                $p->company->name ?? $p->user->company->name ?? '-',
                $p->user->division->name ?? '-',
                $p->user->position->name ?? '-',
                $p->gaji_pokok,
                $p->operasional,
                $p->tunjangan_jabatan,
                $p->thr,
                $p->jumlah_lembur_weekday_pertama ?? 0,
                $p->jumlah_jam_lembur_weekday_berikutnya ?? 0,
                $p->jumlah_jam_lembur_sabtu ?? 0,
                $p->lembur,
                $p->total_penerimaan,
                $p->bpjs_kesehatan,
                $p->bpjs_ketenagakerjaan,
                $p->pajak,
                $p->piutang,
                $p->jumlah_terlambat ?? 0,
                $p->potongan_absen,
                $p->potongan_lainnya,
                $p->total_potongan,
                $p->bpjs_kesehatan_perusahaan,
                $p->bpjs_ketenagakerjaan_perusahaan,
                $p->total_bpjs_perusahaan,
                $p->total_diterima,
                ucfirst($p->status),
            ];
        }

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $monthName = $months[$month] ?? (string)$month;

        return Excel::download(new GenericExport(collect($rows), $headings), "Rekap_Gaji_{$monthName}_{$year}.xlsx");
    }
}
