<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>

        body {
            font-family: {{ request('font', 'sans-serif') }} !important;
            font-size: {{ request('size', '12') }}px !important;
        }
    
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; padding: 0; font-size: 16px; }
        .header p { margin: 5px 0 0 0; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; text-transform: uppercase; font-size: 10px; }
        tr:nth-child(even) { background-color: #fbfbfb; }
        .footer { text-align: right; margin-top: 20px; font-size: 10px; color: #999; font-style: italic; }
    
        /* PDF Fixes for Overflow & Layout */
        table { width: 100%; border-collapse: collapse; table-layout: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        th, td { word-wrap: break-word; overflow-wrap: break-word; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $title }}</h2>
        <p>Dicetak pada: {{ now()->format('d M Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                @foreach($headings as $heading)
                    <th>{{ $heading }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{{ $cell }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        * Dokumen ini di-generate secara otomatis oleh Sistem Sanzaya.
    </div>
</body>
</html>
