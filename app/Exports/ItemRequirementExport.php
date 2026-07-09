<?php

namespace App\Exports;

use App\Models\ItemRequirement;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class ItemRequirementExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $outlet;

    public function __construct($outlet = null)
    {
        $this->outlet = $outlet;
    }

    public function collection()
    {
        if ($this->outlet) {
            return ItemRequirement::where('outlet_name', $this->outlet)->orderBy('id', 'desc')->get();
        }
        return ItemRequirement::orderBy('outlet_name')->orderBy('id', 'desc')->get();
    }

    public function headings(): array
    {
        if ($this->outlet) {
            return [
                'Bulan Tahun',
                'Nama Barang',
                'Satuan',
                'Qty',
                'Keterangan',
                'Harga',
                'Terkirim',
                'Belum',
                'Total',
            ];
        }

        return [
            'Outlet',
            'Bulan Tahun',
            'Nama Barang',
            'Satuan',
            'Qty',
            'Keterangan',
            'Harga',
            'Terkirim',
            'Belum',
            'Total',
        ];
    }

    public function map($item): array
    {
        if ($this->outlet) {
            return [
                $item->month_year,
                $item->item_name,
                $item->unit,
                $item->quantity,
                $item->description,
                $item->price,
                $item->sent,
                $item->not_sent,
                $item->total,
            ];
        }

        return [
            $item->outlet_name,
            $item->month_year,
            $item->item_name,
            $item->unit,
            $item->quantity,
            $item->description,
            $item->price,
            $item->sent,
            $item->not_sent,
            $item->total,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
