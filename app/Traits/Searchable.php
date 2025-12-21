<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Scope a query to search across specified columns
     */
    public function scopeSearch(Builder $query, ?string $search, array $columns = [])
    {
        if (empty($search)) {
            return $query;
        }

        $search = strtolower($search);

        return $query->where(function ($query) use ($search, $columns) {
            foreach ($columns as $column) {
                if (str_contains($column, '.')) {
                    // Handle nested relationships (e.g., 'driver.user.name')
                    $this->addNestedRelationSearch($query, $column, $search);
                } else {
                    // Handle direct column searches
                    $query->orWhereRaw("LOWER({$column}) LIKE ?", ["%{$search}%"]);
                }
            }
        });
    }

    /**
     * Add search for nested relationships
     */
    protected function addNestedRelationSearch(Builder $query, string $column, string $search)
    {
        $parts = explode('.', $column);
        $columnName = array_pop($parts); // Get the actual column name
        $relations = $parts; // Get all relation names

        // Build nested whereHas
        $query->orWhereHas(implode('.', $relations), function ($q) use ($columnName, $search) {
            $q->whereRaw("LOWER({$columnName}) LIKE ?", ["%{$search}%"]);
        });
    }

    /**
     * Scope a query to filter by date range
     */
    public function scopeDateRange(Builder $query, ?string $startDate, ?string $endDate, string $column = 'created_at')
    {
        if ($startDate) {
            $query->whereDate($column, '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate($column, '<=', $endDate);
        }

        return $query;
    }

    /**
     * Scope a query to filter by status
     */
    public function scopeStatus(Builder $query, $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }

        return $query;
    }

    /**
     * Scope a query to filter by multiple values
     */
    public function scopeWhereIn(Builder $query, string $column, $values)
    {
        if (empty($values)) {
            return $query;
        }

        if (is_string($values)) {
            $values = explode(',', $values);
        }

        return $query->whereIn($column, $values);
    }
}