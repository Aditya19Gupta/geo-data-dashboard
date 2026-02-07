'use client';

import React, { useMemo, useState, useCallback, memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GeoData, SortField, SortDirection, SortConfig } from '@/types';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface DataTableProps {
  data: GeoData[];
  selectedId: string | null;
  onRowClick: (id: string) => void;
  isLoading?: boolean;
}

const TableRowMemo = memo(({ 
  item, 
  selectedId, 
  onRowClick 
}: { 
  item: GeoData; 
  selectedId: string | null; 
  onRowClick: (id: string) => void;
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isSelected = selectedId === item.id;

  return (
    <TableRow
      data-row-id={item.id}
      onClick={() => onRowClick(item.id)}
      className={`cursor-pointer ${
        isSelected
          ? 'bg-primary/10 border-l-4 border-l-primary'
          : ''
      }`}
    >
      <TableCell className="font-medium">
        {item.projectName}
      </TableCell>
      <TableCell>{item.latitude.toFixed(6)}</TableCell>
      <TableCell>{item.longitude.toFixed(6)}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.status === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : item.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {item.status}
        </span>
      </TableCell>
      <TableCell>{formatDate(item.lastUpdated)}</TableCell>
    </TableRow>
  );
});

TableRowMemo.displayName = 'TableRowMemo';

export const DataTable = memo(function DataTable({ data, selectedId, onRowClick, isLoading }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: 'asc',
  });

  const handleSort = useCallback((field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.projectName.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term) ||
          item.latitude.toString().includes(term) ||
          item.longitude.toString().includes(term)
      );
    }

    // Apply sorting
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field!];
        const bValue = b[sortConfig.field!];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          placeholder="Search by project name, status, or coordinates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort('projectName')}
                >
                  Project Name
                  {getSortIcon('projectName')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort('latitude')}
                >
                  Latitude
                  {getSortIcon('latitude')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort('longitude')}
                >
                  Longitude
                  {getSortIcon('longitude')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleSort('lastUpdated')}
                >
                  Last Updated
                  {getSortIcon('lastUpdated')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((item) => (
                <TableRowMemo
                  key={item.id}
                  item={item}
                  selectedId={selectedId}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t text-sm text-muted-foreground">
        Showing {filteredAndSortedData.length} of {data.length} records
      </div>
    </div>
  );
});

