<?php

namespace App\Enums;

class RequestStatus
{
    const MENUNGGU = 'Menunggu';
    const DISETUJUI = 'Disetujui';
    const DITOLAK = 'Ditolak';
    const SELESAI = 'Selesai';
    const PENDING = 'Pending';

    /**
     * Status yang valid untuk approval flow.
     */
    public static function approvalStatuses(): array
    {
        return [self::DISETUJUI, self::DITOLAK];
    }

    /**
     * Status yang valid untuk UC approval flow.
     */
    public static function ucStatuses(): array
    {
        return [
            self::MENUNGGU,
            self::DISETUJUI,
            self::DITOLAK,
            'Diproses',
            'Selesai / Result Dikirim',
        ];
    }

    /**
     * Status yang valid untuk BHP approval flow.
     */
    public static function bhpStatuses(): array
    {
        return [self::DISETUJUI, self::DITOLAK, self::MENUNGGU];
    }

    /**
     * Semua status dalam bentuk array (untuk validasi generik).
     */
    public static function all(): array
    {
        return [
            self::MENUNGGU,
            self::DISETUJUI,
            self::DITOLAK,
            self::SELESAI,
            self::PENDING,
        ];
    }
}
