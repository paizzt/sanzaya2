<?php

namespace App\Helpers;

use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelType;

class ExcelPreviewHelper
{
    public static function render($export)
    {
        $html = Excel::raw($export, ExcelType::HTML);
        
        $customCss = "
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                padding: 24px; 
                background-color: #f8fafc; 
                color: #334155; 
                margin: 0;
            }
            
            /* Hide the default page wrapper styles from PhpSpreadsheet */
            div[style*='page: page0'] { margin: 0 !important; }
            
            table.sheet0 { 
                width: 100% !important; 
                border-collapse: separate !important; 
                border-spacing: 0 !important; 
                background: white !important; 
                border-radius: 12px !important; 
                overflow: hidden !important; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important; 
                border: 1px solid #e2e8f0 !important;
                margin-top: 10px !important; 
            }
            
            /* Header styles */
            table.sheet0 tr:first-child td, table.sheet0 tr:first-child th { 
                background-color: #f1f5f9 !important; 
                font-weight: 700 !important; 
                color: #0f172a !important; 
                text-transform: uppercase !important; 
                font-size: 0.75rem !important; 
                letter-spacing: 0.05em !important; 
                padding: 14px 16px !important;
                border-bottom: 2px solid #e2e8f0 !important;
            }
            
            /* Cell styles */
            table.sheet0 td, table.sheet0 th { 
                border: none !important;
                border-bottom: 1px solid #e2e8f0 !important; 
                padding: 12px 16px !important; 
                text-align: left !important; 
                font-size: 0.875rem !important;
                vertical-align: middle !important;
            }
            
            /* Remove right border on last column */
            table.sheet0 td:last-child, table.sheet0 th:last-child {
                border-right: none !important;
            }
            
            /* Remove bottom border on last row */
            table.sheet0 tr:last-child td {
                border-bottom: none !important;
            }
            
            /* Hover effect */
            table.sheet0 tr:not(:first-child):hover td { 
                background-color: #f8fafc !important; 
            }
            
            /* Override gridlines from PhpSpreadsheet */
            @media screen {
                .gridlines td, .gridlines th { border: none !important; border-bottom: 1px solid #e2e8f0 !important; }
            }
        </style>
        ";
        
        // Inject right before </head>
        return str_replace('</head>', $customCss . '</head>', $html);
    }
}
