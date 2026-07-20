<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->format('Y-m-d');
        $attendance = Attendance::where('user_id', Auth::id())
            ->where('date', $today)
            ->first();

        // Cek apakah ada check-in hari sebelumnya yang belum check-out
        if (!$attendance) {
            $yesterday = Carbon::yesterday()->format('Y-m-d');
            $uncompleted = Attendance::where('user_id', Auth::id())
                ->where('date', $yesterday)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->first();
            
            if ($uncompleted) {
                $attendance = $uncompleted;
            }
        }

        $now = Carbon::now();
        $isOvertime = false;
        
        if ($attendance && $attendance->check_in_time && !$attendance->check_out_time) {
            $attDate = Carbon::parse($attendance->date);
            if ($now->isSameDay($attDate)) {
                if ($now->hour >= 20) {
                    $isOvertime = true;
                }
            } else if ($now->isAfter($attDate)) {
                $isOvertime = true;
            }
        }

        return Inertia::render('Absensi/Index', [
            'attendance' => $attendance,
            'today' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
            'currentTime' => Carbon::now()->format('H:i'),
            'isOvertime' => $isOvertime,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photo' => 'required|string',
            'type' => 'required|in:check_in,check_out'
        ]);

        $user = Auth::user();
        $today = Carbon::today()->format('Y-m-d');
        $currentTime = Carbon::now()->format('H:i:s');

        // Decode Base64 Image
        $image = $request->photo;
        $imageParts = explode(";base64,", $image);
        $imageTypeAux = explode("image/", $imageParts[0]);
        $imageType = $imageTypeAux[1];
        $imageBase64 = base64_decode($imageParts[1]);
        
        $fileName = 'attendances/' . $user->id . '_' . time() . '.' . $imageType;
        Storage::disk('public')->put($fileName, $imageBase64);

        if ($request->type === 'check_in') {
            $attendance = Attendance::firstOrCreate(
                ['user_id' => $user->id, 'date' => $today],
                ['status' => 'Hadir']
            );

            if ($attendance->check_in_time) {
                return redirect()->back()->with('error', 'Anda sudah melakukan absensi masuk hari ini.');
            }
            $attendance->check_in_time = $currentTime;
            $attendance->check_in_photo = $fileName;
            $attendance->save();
        } else {
            // Find the active uncompleted attendance
            $attendance = Attendance::where('user_id', $user->id)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->orderBy('date', 'desc')
                ->first();

            if (!$attendance) {
                return redirect()->back()->with('error', 'Tidak ada absensi masuk yang bisa di-checkout.');
            }

            $now = Carbon::now();
            $attDate = Carbon::parse($attendance->date);
            
            $isOvertime = false;
            if ($now->isSameDay($attDate)) {
                if ($now->hour >= 20) {
                    $isOvertime = true;
                }
            } else if ($now->isAfter($attDate)) {
                $isOvertime = true;
            }

            if ($isOvertime && empty($request->notes)) {
                return redirect()->back()->with('error', 'Catatan lembur wajib diisi karena Anda pulang di atas jam 20:00!');
            }

            if ($now->isAfter($attDate) && !$now->isSameDay($attDate)) {
                // If it's the next day (e.g. 01:00 AM), cap the checkout time to 23:59:59 of the attendance date
                $attendance->check_out_time = '23:59:59';
            } else {
                $attendance->check_out_time = $now->format('H:i:s');
            }
            
            $attendance->check_out_photo = $fileName;
            
            if ($isOvertime) {
                $attendance->notes = $request->notes;
            }
            
            $attendance->save();
        }

        $message = $request->type === 'check_in' ? 'Berhasil Absen Masuk!' : 'Berhasil Absen Pulang!';
        return redirect()->back()->with('success', $message);
    }
}
