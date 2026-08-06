<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Provider;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ImportProviderData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:provider-data {file=datapenyedia.csv}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import provider and product data from CSV';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');
        
        if (!file_exists(base_path($file))) {
            $this->error("File {$file} not found in root directory.");
            return;
        }

        $this->info("Starting import from {$file}...");

        $handle = fopen(base_path($file), "r");
        
        // Read header
        $header = fgetcsv($handle);
        $count = 0;

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                // Ensure row has enough columns
                if (count($row) < 6) {
                    continue;
                }

                $providerName = trim($row[0]);
                if (empty($providerName)) {
                    continue;
                }

                $productNameAndCode = trim($row[1]);
                $registrationNo = trim($row[2]);
                $qtyAndUnit = trim($row[3]);
                $price = trim($row[4]);
                $statusStr = trim($row[5]);

                // 1. Find or create Provider
                $provider = Provider::firstOrCreate(
                    ['name' => $providerName]
                );

                // 2. Parse Product Name and Code
                $productName = $productNameAndCode;
                $code = null;
                if (preg_match('/^(.*)\s*\(Kode:\s*(.*)\)$/i', $productNameAndCode, $matches)) {
                    $productName = trim($matches[1]);
                    $code = trim($matches[2]);
                }

                // 3. Parse Qty and Unit
                $qty = null;
                $unit = null;
                if (preg_match('/^([\d\.]+)\s*(.*)$/i', $qtyAndUnit, $matches)) {
                    $qty = (float)$matches[1];
                    $unit = trim($matches[2]);
                } else {
                    $qty = is_numeric($qtyAndUnit) ? (float)$qtyAndUnit : null;
                    $unit = !is_numeric($qtyAndUnit) ? $qtyAndUnit : null;
                }

                // 4. Parse Price
                // Clean up price (remove non-digits if necessary, keeping dot)
                $priceCleaned = preg_replace('/[^\d\.]/', '', $price);
                $priceVal = empty($priceCleaned) ? 0 : (float)$priceCleaned;

                // 5. Parse Status
                $isActive = strtolower($statusStr) === 'aktif';

                // Create Product
                Product::create([
                    'provider_id' => $provider->id,
                    'name' => $productName,
                    'code' => $code,
                    'registration_no' => empty($registrationNo) ? null : $registrationNo,
                    'qty' => $qty ?? 0,
                    'unit' => empty($unit) ? null : $unit,
                    'price' => $priceVal,
                    'is_active' => $isActive,
                ]);

                $count++;
            }
            DB::commit();
            $this->info("Import completed successfully. {$count} products imported.");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error importing data: " . $e->getMessage());
        }

        fclose($handle);
    }
}
