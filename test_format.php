<?php

$targetTahunanDetail = [];
$ptPenjualanAnn = 28029529851;
$annual_target = 51000000000;
$capPercent = ($annual_target > 0) ? ($ptPenjualanAnn / $annual_target) * 100 : 0;

$targetTahunanDetail['RSUD'] = 'Rp ' . number_format($ptPenjualanAnn, 0, ',', '.') . ' / Rp ' . number_format($annual_target, 0, ',', '.') . ' (' . number_format($capPercent, 1, ',', '.') . '%)';

print_r($targetTahunanDetail);

$targetDetail = ['ILHAM' => 'Rp 700.000.000'];
$capaianDetail = ['ILHAM' => ['sales' => 18200000, 'percent' => '2,6%']];

foreach ($targetDetail as $key => $val) {
    if (isset($capaianDetail[$key])) {
        $salesVal = $capaianDetail[$key]['sales'] ?? 0;
        $percentStr = $capaianDetail[$key]['percent'] ?? '0%';
        $targetDetail[$key] = 'Rp ' . number_format($salesVal, 0, ',', '.') . ' / ' . $val . ' (' . $percentStr . ')';
    }
}

print_r($targetDetail);
