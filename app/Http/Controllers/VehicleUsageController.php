<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VehicleUsage;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VehicleUsageController extends Controller
{
    public function index(Request $request)
    {
        $query = VehicleUsage::with(['vehicle', 'user'])->orderBy('created_at', 'desc');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        $usages = $query->paginate(50);
        $vehicles = Vehicle::orderBy('license_plate')->get();

        return Inertia::render('Vehicles/Usages', [
            'usages' => $usages,
            'vehicles' => $vehicles,
            'filters' => $request->only(['vehicle_id'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'destination' => 'nullable|string|max:255',
            'gas_expense' => 'nullable|numeric|min:0',
            'usage_photo' => 'nullable|image|max:5120', // 5MB max
            'receipt_photo' => 'nullable|array',
            'receipt_photo.*' => 'image|max:5120',
        ]);

        $data = $request->except(['usage_photo', 'receipt_photo']);
        $data['user_id'] = auth()->id();

        if ($request->hasFile('usage_photo')) {
            $data['usage_photo'] = $request->file('usage_photo')->store('vehicle_usages', 'public');
        }

        if ($request->hasFile('receipt_photo')) {
            $receiptPhotos = [];
            foreach ($request->file('receipt_photo') as $photo) {
                $receiptPhotos[] = $photo->store('vehicle_usages', 'public');
            }
            $data['receipt_photo'] = $receiptPhotos;
        }

        VehicleUsage::create($data);

        return redirect()->back()->with('success', 'Catatan penggunaan kendaraan berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $usage = VehicleUsage::findOrFail($id);
        
        if ($usage->usage_photo) {
            Storage::disk('public')->delete($usage->usage_photo);
        }
        
        if ($usage->receipt_photo && is_array($usage->receipt_photo)) {
            foreach ($usage->receipt_photo as $photo) {
                Storage::disk('public')->delete($photo);
            }
        } elseif ($usage->receipt_photo) {
            // Fallback if it was stored as a single string previously
            Storage::disk('public')->delete($usage->receipt_photo);
        }
        
        $usage->delete();

        return redirect()->back()->with('success', 'Catatan penggunaan berhasil dihapus.');
    }
}
