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
            'last_odometer' => 'required|numeric|min:0',
            'destination' => 'nullable|string|max:255',
            'usage_photo' => 'nullable|image|max:5120',
        ]);

        $data = $request->only(['vehicle_id', 'last_odometer', 'destination']);
        $data['user_id'] = auth()->id();
        $data['status'] = 'in_use';

        if ($request->hasFile('usage_photo')) {
            $data['usage_photo'] = $request->file('usage_photo')->store('vehicle_usages', 'public');
        }

        VehicleUsage::create($data);

        $vehicle = Vehicle::find($request->vehicle_id);
        if ($vehicle && $request->last_odometer > $vehicle->current_odometer) {
            $vehicle->update(['current_odometer' => $request->last_odometer]);
        }

        return redirect()->back()->with('success', 'Keberangkatan armada berhasil dicatat.');
    }

    public function update(Request $request, $id)
    {
        $usage = VehicleUsage::findOrFail($id);
        
        $request->validate([
            'final_odometer' => 'required|numeric|min:' . ($usage->last_odometer ?: 0),
            'gas_expense' => 'nullable|numeric|min:0',
            'receipt_photo' => 'nullable|array',
            'receipt_photo.*' => 'image|max:5120',
        ]);

        $data = $request->only(['final_odometer', 'gas_expense']);
        $data['status'] = 'completed';

        if ($request->hasFile('receipt_photo')) {
            $receiptPhotos = is_array($usage->receipt_photo) ? $usage->receipt_photo : [];
            foreach ($request->file('receipt_photo') as $photo) {
                $receiptPhotos[] = $photo->store('vehicle_usages', 'public');
            }
            $data['receipt_photo'] = $receiptPhotos;
        }

        $usage->update($data);

        $vehicle = Vehicle::find($usage->vehicle_id);
        if ($vehicle) {
            $vehicle->update(['current_odometer' => $request->final_odometer]);
        }

        return redirect()->back()->with('success', 'Kepulangan armada berhasil dicatat.');
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
