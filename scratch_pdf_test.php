<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PaymentRequest;
use Barryvdh\DomPDF\Facade\Pdf;

$pr = PaymentRequest::with(['requester', 'division', 'vendor', 'items', 'approvals.approver'])->first();

$qrUrl = url('/payment-requests/' . $pr->id);
$qrCode = base64_encode(\SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(100)->generate($qrUrl));

try {
    $pdf = Pdf::loadView('pdf.payment_request', [
        'paymentRequest' => $pr,
        'qrCode' => $qrCode
    ]);

    $pdf->save(__DIR__ . '/test_pr.pdf');
    echo "PDF generated successfully at test_pr.pdf\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
