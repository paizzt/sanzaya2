<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Provider;
use App\Models\ProviderProduct;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class ImportNewProvidersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:new-providers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import providers and products from PT INDOCORE PERKASA and SNA MEDIKA excel files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->importIndocore();
        $this->importSnaMedika();
        
        $this->info('Import completed successfully!');
    }

    private function importIndocore()
    {
        $this->info('Importing PT. INDOCORE PERKASA...');
        $provider = Provider::firstOrCreate(
            ['name' => 'PT. INDOCORE PERKASA (NON DISTRIBUTOR)'],
            ['type' => 'Non Distributor', 'business_type' => 'Supplier']
        );

        $filePath = base_path('PRICE LIST = PT. INDOCORE PERKASA (NON DISTRIBUTOR).xlsx');
        if (!file_exists($filePath)) {
            $this->error('File not found: ' . $filePath);
            return;
        }

        $data = Excel::toArray(new \stdClass, $filePath);
        $rows = $data[0] ?? [];

        $count = 0;
        foreach ($rows as $index => $row) {
            // Data starts after headers, roughly row 3 (index 2)
            if ($index < 2) continue;

            $brand = $row[0] ?? null;
            $category = $row[1] ?? null;
            $item = $row[2] ?? null;
            $pricePlusPpn = $row[4] ?? 0;

            if (empty($item)) continue;

            // Clean price
            if (is_numeric($pricePlusPpn)) {
                $price = $pricePlusPpn;
            } else {
                $price = (float) preg_replace('/[^0-9.]/', '', $pricePlusPpn);
            }

            ProviderProduct::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'name' => $item,
                ],
                [
                    'description' => trim("$brand - $category", " -"),
                    'price' => $price,
                    'is_active' => true,
                ]
            );
            $count++;
        }
        $this->info("Imported $count products for PT. INDOCORE PERKASA.");
    }

    private function importSnaMedika()
    {
        $this->info('Importing SNA MEDIKA...');
        $provider = Provider::firstOrCreate(
            ['name' => 'SNA MEDIKA (Non distributor)'],
            ['type' => 'Non Distributor', 'business_type' => 'Supplier']
        );

        $filePath = base_path('price list SNA MEDIKA (Non distributor).xls');
        if (!file_exists($filePath)) {
            $this->error('File not found: ' . $filePath);
            return;
        }

        $data = Excel::toArray(new \stdClass, $filePath);
        $rows = $data[0] ?? [];

        $count = 0;
        foreach ($rows as $index => $row) {
            // Data starts after headers, roughly row 4 (index 3)
            if ($index < 3) continue;

            $code = $row[0] ?? null;
            $description = $row[1] ?? null;
            $unit = $row[2] ?? null;
            $hna = $row[3] ?? 0;
            $qty = $row[4] ?? 1;
            $keterangan = $row[5] ?? null;

            if (empty($description)) continue;

            // Clean price
            if (is_numeric($hna)) {
                $price = $hna;
            } else {
                $price = (float) preg_replace('/[^0-9.]/', '', $hna);
            }

            if (!is_numeric($qty)) {
                $qty = 1;
            }

            ProviderProduct::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'name' => $description,
                ],
                [
                    'code' => $code,
                    'unit' => $unit,
                    'hna' => $price,
                    'price' => $price, // use hna as price
                    'qty' => $qty,
                    'description' => $keterangan,
                    'is_active' => true,
                ]
            );
            $count++;
        }
        $this->info("Imported $count products for SNA MEDIKA.");
    }
}
