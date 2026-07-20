<?php
$f = 'resources/js/Pages/Reports/Index.jsx';
$c = file_get_contents($f);

$logistikStart = strpos($c, "{tab === 'logistik' && summary && (");
$pesananStart = strpos($c, "{tab === 'pesanan' && summaryPesanan && (");

$logistikBlock = substr($c, $logistikStart, $pesananStart - $logistikStart);

$onClickString = "onClick={() => document.getElementById('data-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}";

// Total Penjualan
$newOnClickPenjualan = "onClick={() => setDetailModal({ isOpen: true, title: 'Total Penjualan', type: 'penjualan', data: summary.penjualan_detail })}";
$logistikBlock = preg_replace('/' . preg_quote($onClickString, '/') . '([^>]+>[\s\S]*?<p[^>]+>Total Penjualan<\/p>)/', $newOnClickPenjualan . '$1', $logistikBlock);

// Total Pesanan
$newOnClickPesanan = "onClick={() => setDetailModal({ isOpen: true, title: 'Total Pesanan', type: 'pesanan', data: summary.pesanan_detail })}";
$logistikBlock = preg_replace('/' . preg_quote($onClickString, '/') . '([^>]+>[\s\S]*?<p[^>]+>Total Pesanan<\/p>)/', $newOnClickPesanan . '$1', $logistikBlock);

// Top Outlet
$newOnClickOutlet = "onClick={() => setDetailModal({ isOpen: true, title: 'Top Outlet', type: 'outlet', data: summary.outlet_detail })}";
$logistikBlock = preg_replace('/' . preg_quote($onClickString, '/') . '([^>]+>[\s\S]*?<p[^>]+>Top Outlet<\/p>)/', $newOnClickOutlet . '$1', $logistikBlock);

// Top Produk
$newOnClickProduk = "onClick={() => setDetailModal({ isOpen: true, title: 'Top Produk', type: 'produk', data: summary.produk_detail })}";
$logistikBlock = preg_replace('/' . preg_quote($onClickString, '/') . '([^>]+>[\s\S]*?<p[^>]+>Top Produk<\/p>)/', $newOnClickProduk . '$1', $logistikBlock);

$c = substr_replace($c, $logistikBlock, $logistikStart, $pesananStart - $logistikStart);
file_put_contents($f, $c);
echo "Patched onClicks in Reports/Index.jsx\n";
