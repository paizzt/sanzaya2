<?php

namespace App\Models;

use App\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use LogsActivity;

    use HasFactory;

    protected $fillable = [
        'license_plate',
        'chassis_number',
        'brand_type',
        'manufacture_year',
        'color',
        'capacity',
        'photo',
        'annual_tax_date',
        'five_year_tax_date',
        'plate_replacement_date',
        'stnk_expiry_date',
        'kir_expiry_date',
        'insurance_policy',
        'insurance_expiry_date',
        'scheduled_service_date',
        'repair_history',
        'last_odometer',
        'current_odometer',
        'oil_change_schedule',
        'engine_oil_target_km',
        'oil_filter_target_km',
        'air_filter_target_km',
        'ac_filter_target_km',
        'transmission_oil_target_km',
        'spark_plug_target_km',
        'brake_pad_target_km',
        'battery_target_date',
        'tire_target_date',
    ];
}
