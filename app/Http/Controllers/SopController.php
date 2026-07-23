<?php

namespace App\Http\Controllers;

use App\Models\Sop;
use App\Models\SopDivision;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SopController extends Controller
{
    public function index()
    {
        $divisions = SopDivision::withCount('sops')->get();
        return Inertia::render('Sops/Index', [
            'divisions' => $divisions
        ]);
    }

    public function storeDivision(Request $request)
    {
        if (!auth()->user()->hasRole('Superadmin')) { abort(403, 'Unauthorized action.'); }

        if (!auth()->user()->hasRole('Superadmin')) { abort(403, 'Unauthorized action.'); }

        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        SopDivision::create($request->all());

        return redirect()->back()->with('success', 'Devisi SOP berhasil ditambahkan');
    }

    public function destroyDivision(SopDivision $sop_division)
    {
        if (!auth()->user()->hasRole('Superadmin')) { abort(403, 'Unauthorized action.'); }

        if (!auth()->user()->hasRole('Superadmin')) { abort(403, 'Unauthorized action.'); }

        $sop_division->delete();
        return redirect()->back()->with('success', 'Devisi SOP berhasil dihapus');
    }

    public function show(SopDivision $sop_division)
    {
        $sop_division->load('sops');
        return Inertia::render('Sops/Show', [
            'division' => $sop_division
        ]);
    }

    public function store(Request $request, SopDivision $sop_division)
    {
        $request->validate([
            'title' => 'required|string|max:255'
        ]);

        $sop_division->sops()->create([
            'title' => $request->title,
            'description' => $request->description
        ]);

        return redirect()->back()->with('success', 'Pekerjaan SOP berhasil ditambahkan');
    }

    public function update(Request $request, Sop $sop)
    {
        if (!auth()->user()->hasRole('Superadmin')) { abort(403, 'Unauthorized action.'); }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'step_texts' => 'nullable|array',
            'step_images' => 'nullable|array',
            'step_images.*' => 'nullable|image|max:5120',
            'existing_step_images' => 'nullable|array',
        ]);

        $data = $request->only(['title', 'description']);

        $stepTexts = $request->input('step_texts', []);
        $stepImages = $request->file('step_images', []);
        $existingImages = $request->input('existing_step_images', []);
        $stepsData = [];

        foreach ($stepTexts as $index => $text) {
            $hasNewImage = $request->hasFile("step_images.$index");
            $oldImage = $existingImages[$index] ?? null;
            
            if (trim($text) === '' && !$hasNewImage && empty($oldImage)) {
                continue;
            }

            $imagePath = $oldImage;

            if ($hasNewImage) {
                if ($oldImage && \Storage::disk('public')->exists($oldImage)) {
                    \Storage::disk('public')->delete($oldImage);
                }
                $imagePath = $request->file("step_images.$index")->store('sops/steps', 'public');
            }

            $stepsData[] = [
                'text' => $text,
                'image' => $imagePath
            ];
        }

        $data['steps'] = $stepsData;

        $sop->update($data);

        return redirect()->back()->with('success', 'Pekerjaan SOP berhasil diperbarui');
    }

    public function destroy(Sop $sop)
    {
        if ($sop->image && \Storage::disk('public')->exists($sop->image)) {
            \Storage::disk('public')->delete($sop->image);
        }

        if (is_array($sop->steps)) {
            foreach ($sop->steps as $step) {
                if (!empty($step['image']) && \Storage::disk('public')->exists($step['image'])) {
                    \Storage::disk('public')->delete($step['image']);
                }
            }
        }
        
        $sop->delete();
        return redirect()->back()->with('success', 'Pekerjaan SOP berhasil dihapus');
    }
}
