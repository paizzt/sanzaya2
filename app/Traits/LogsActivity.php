<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            static::logAction($model, 'Created');
        });

        static::updated(function ($model) {
            static::logAction($model, 'Updated');
        });

        static::deleted(function ($model) {
            static::logAction($model, 'Deleted');
        });
    }

    protected static function logAction($model, $action)
    {
        if (Auth::check()) {
            $old_values = null;
            $new_values = null;

            if ($action === 'Updated') {
                $changes = $model->getChanges();
                $old = [];
                foreach ($changes as $key => $value) {
                    // Ignore tracking changes for updated_at
                    if ($key !== 'updated_at') {
                        $old[$key] = $model->getOriginal($key);
                    }
                }
                
                // If only updated_at changed, do not log
                if (empty($old)) {
                    return;
                }
                
                $old_values = json_encode($old);
                // Also remove updated_at from new values to keep logs clean
                unset($changes['updated_at']);
                $new_values = json_encode($changes);
            } else if ($action === 'Created') {
                $attributes = $model->getAttributes();
                unset($attributes['created_at']);
                unset($attributes['updated_at']);
                $new_values = json_encode($attributes);
            } else if ($action === 'Deleted') {
                $attributes = $model->getAttributes();
                $old_values = json_encode($attributes);
            }

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'module' => class_basename($model),
                'old_values' => $old_values,
                'new_values' => $new_values,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent()
            ]);
        }
    }
}
