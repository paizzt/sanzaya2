<?php
require 'vendor/autoload.php';
$spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load('PT SNA MEdika (Non distributor).xls');
$sheet = $spreadsheet->getActiveSheet();
$rows = [];
foreach ($sheet->getRowIterator(1, 10) as $row) {
    $cellIterator = $row->getCellIterator();
    $cellIterator->setIterateOnlyExistingCells(false);
    $rowData = [];
    foreach ($cellIterator as $cell) {
        $rowData[] = $cell->getValue();
    }
    $rows[] = $rowData;
}
echo json_encode($rows, JSON_PRETTY_PRINT);
