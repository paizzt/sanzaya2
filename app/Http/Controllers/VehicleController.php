<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vehicles = Vehicle::latest()->paginate(10);
        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Vehicles/Form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'license_plate' => 'required|string|max:255|unique:vehicles',
            'chassis_number' => 'nullable|string|max:255',
            'brand_type' => 'nullable|string|max:255',
            'manufacture_year' => 'nullable|integer',
            'color' => 'nullable|string|max:255',
            'capacity' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'annual_tax_date' => 'nullable|date',
            'five_year_tax_date' => 'nullable|date',
            'plate_replacement_date' => 'nullable|date',
            'stnk_expiry_date' => 'nullable|date',
            'kir_expiry_date' => 'nullable|date',
            'insurance_policy' => 'nullable|string|max:255',
            'insurance_expiry_date' => 'nullable|date',
            'scheduled_service_date' => 'nullable|date',
            'repair_history' => 'nullable|string',
            'last_odometer' => 'nullable|integer',
            'current_odometer' => 'nullable|integer',
            'oil_change_schedule' => 'nullable|date',
            'engine_oil_target_km' => 'nullable|integer',
            'oil_filter_target_km' => 'nullable|integer',
            'air_filter_target_km' => 'nullable|integer',
            'ac_filter_target_km' => 'nullable|integer',
            'transmission_oil_target_km' => 'nullable|integer',
            'spark_plug_target_km' => 'nullable|integer',
            'brake_pad_target_km' => 'nullable|integer',
            'battery_target_date' => 'nullable|date',
            'tire_target_date' => 'nullable|date',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('vehicles', 'public');
            $validated['photo'] = $path;
        }

        Vehicle::create($validated);

        return redirect()->route('vehicles.index')->with('success', 'Data armada berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vehicle $vehicle)
    {
        return Inertia::render('Vehicles/Form', [
            'vehicle' => $vehicle
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'license_plate' => 'required|string|max:255|unique:vehicles,license_plate,' . $vehicle->id,
            'chassis_number' => 'nullable|string|max:255',
            'brand_type' => 'nullable|string|max:255',
            'manufacture_year' => 'nullable|integer',
            'color' => 'nullable|string|max:255',
            'capacity' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'annual_tax_date' => 'nullable|date',
            'five_year_tax_date' => 'nullable|date',
            'plate_replacement_date' => 'nullable|date',
            'stnk_expiry_date' => 'nullable|date',
            'kir_expiry_date' => 'nullable|date',
            'insurance_policy' => 'nullable|string|max:255',
            'insurance_expiry_date' => 'nullable|date',
            'scheduled_service_date' => 'nullable|date',
            'repair_history' => 'nullable|string',
            'last_odometer' => 'nullable|integer',
            'current_odometer' => 'nullable|integer',
            'oil_change_schedule' => 'nullable|date',
            'engine_oil_target_km' => 'nullable|integer',
            'oil_filter_target_km' => 'nullable|integer',
            'air_filter_target_km' => 'nullable|integer',
            'ac_filter_target_km' => 'nullable|integer',
            'transmission_oil_target_km' => 'nullable|integer',
            'spark_plug_target_km' => 'nullable|integer',
            'brake_pad_target_km' => 'nullable|integer',
            'battery_target_date' => 'nullable|date',
            'tire_target_date' => 'nullable|date',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($vehicle->photo) {
                Storage::disk('public')->delete($vehicle->photo);
            }
            $path = $request->file('photo')->store('vehicles', 'public');
            $validated['photo'] = $path;
        }

        $vehicle->update($validated);

        return redirect()->route('vehicles.index')->with('success', 'Data armada berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        if ($vehicle->photo) {
            Storage::disk('public')->delete($vehicle->photo);
        }
        $vehicle->delete();

        return redirect()->route('vehicles.index')->with('success', 'Data armada berhasil dihapus.');
    }
}
