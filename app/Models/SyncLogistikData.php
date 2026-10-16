<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncLogistikData extends Model
{
    protected $guarded = [];

    public function scopeOrderByLatestTanggal($query)
    {
        $rawSql = "
            COALESCE(
                STR_TO_DATE(TRIM(tanggal), '%Y-%m-%d'),
                STR_TO_DATE(TRIM(tanggal), '%d/%m/%Y'),
                STR_TO_DATE(TRIM(tanggal), '%d-%m-%Y'),
                STR_TO_DATE(TRIM(tanggal), '%d.%m.%Y'),
                STR_TO_DATE(
                    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                        REPLACE(REPLACE(LOWER(TRIM(tanggal)), '-', ' '), '/', ' '),
                        'januari', '01'), 'februari', '02'), 'maret', '03'), 'april', '04'),
                        'mei', '05'), 'juni', '06'), 'juli', '07'), 'agustus', '08'),
                        'september', '09'), 'oktober', '10'), 'november', '11'), 'desember', '12'
                    ),
                    '%e %c %Y'
                ),
                STR_TO_DATE(
                    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                        REPLACE(REPLACE(LOWER(TRIM(tanggal)), '-', ' '), '/', ' '),
                        'jan', '01'), 'feb', '02'), 'mar', '03'), 'apr', '04'),
                        'may', '05'), 'jun', '06'), 'jul', '07'), 'agu', '08'),
                        'sep', '09'), 'okt', '10'), 'nov', '11'), 'des', '12'
                    ),
                    '%e %c %Y'
                )
            ) DESC, id DESC
        ";

        return $query->orderByRaw($rawSql);
    }
}
