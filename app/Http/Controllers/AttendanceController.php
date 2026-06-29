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

        return Inertia::render('Absensi/Index', [
            'attendance' => $attendance,
            'today' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
            'currentTime' => Carbon::now()->format('H:i'),
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

        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            ['status' => 'Hadir']
        );

        if ($request->type === 'check_in') {
            if ($attendance->check_in_time) {
                return redirect()->back()->with('error', 'Anda sudah melakukan absensi masuk hari ini.');
            }
            $attendance->check_in_time = $currentTime;
            $attendance->check_in_photo = $fileName;
        } else {
            if (!$attendance->check_in_time) {
                return redirect()->back()->with('error', 'Anda belum melakukan absensi masuk hari ini.');
            }
            if ($attendance->check_out_time) {
                return redirect()->back()->with('error', 'Anda sudah melakukan absensi pulang hari ini.');
            }
            $attendance->check_out_time = $currentTime;
            $attendance->check_out_photo = $fileName;
        }

        $attendance->save();

        $message = $request->type === 'check_in' ? 'Berhasil Absen Masuk!' : 'Berhasil Absen Pulang!';
        return redirect()->back()->with('success', $message);
    }
}
