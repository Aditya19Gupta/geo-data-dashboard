'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataTable } from './DataTable';
import { MapWrapper } from './MapWrapper';
import { fetchAllGeoData } from '@/lib/api';
import { GeoData, LayoutMode, MapTileStyle, ApiGeoDataResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid, Table as TableIcon, Map as MapIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Dashboard() {
  const [allData, setAllData] = useState<GeoData[]>([]);
  const [displayData, setDisplayData] = useState<GeoData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('street');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAllGeoData();
        
        const transformedData: GeoData[] = data.map((item: ApiGeoDataResponse): GeoData => {
          const getLatitude = (): number => {
            const value = item.latitude || item.Latitude || item.lat;
            if (typeof value === 'string') return parseFloat(value) || 0;
            if (typeof value === 'number') return value;
            return 0;
          };

          const getLongitude = (): number => {
            const value = item.longitude || item.Longitude || item.lng || item.lon;
            if (typeof value === 'string') return parseFloat(value) || 0;
            if (typeof value === 'number') return value;
            return 0;
          };

          return {
            id: item.id || item.Id || String(Math.random()),
            projectName: item.projectName || item.ProjectName || item.name || 'Unknown Project',
            latitude: getLatitude(),
            longitude: getLongitude(),
            status: item.status || item.Status || 'Unknown',
            lastUpdated: item.lastUpdated || item.LastUpdated || item.lastDdate || item.updatedAt || new Date().toISOString(),
          };
        });

        setAllData(transformedData);
        setDisplayData(transformedData);
      } catch {
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (allData.length > 0) {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setDisplayData(allData.slice(start, end));
    } else {
      setDisplayData([]);
    }
  }, [currentPage, allData, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleRowClick = useCallback((id: string) => {
    setSelectedId(id);
    const tableContainer = document.querySelector('[data-table-container]');
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id);
    const row = document.querySelector(`[data-row-id="${id}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const selectedItem = useMemo(() => {
    return displayData.find((item) => item.id === selectedId) || null;
  }, [displayData, selectedId]);

  const totalPages = Math.ceil(allData.length / itemsPerPage);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Geo Data Dashboard</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Total Records: {allData.length}
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={layoutMode} onValueChange={(value) => setLayoutMode(value as LayoutMode)}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    {layoutMode === 'split' && <LayoutGrid className="h-4 w-4" />}
                    {layoutMode === 'table' && <TableIcon className="h-4 w-4" />}
                    {layoutMode === 'map' && <MapIcon className="h-4 w-4" />}
                    <SelectValue placeholder="Layout" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="split">Split View</SelectItem>
                  <SelectItem value="table">Table Only</SelectItem>
                  <SelectItem value="map">Map Only</SelectItem>
                </SelectContent>
              </Select>

              {layoutMode !== 'table' && (
                <Select value={tileStyle} onValueChange={(value) => setTileStyle(value as MapTileStyle)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Map Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="street">Street</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(parseInt(value, 10))}
                >
                  <SelectTrigger className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div 
        className={`flex-1 grid gap-4 p-4 overflow-hidden ${
          layoutMode === 'split' 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1'
        }`}
      >
        {(layoutMode === 'split' || layoutMode === 'table') && (
          <div className="border rounded-lg overflow-hidden bg-background flex flex-col min-h-0">
            <div className="p-2 border-b bg-muted/50">
              <h2 className="font-semibold text-sm">Data Table</h2>
            </div>
            <div className="flex-1 overflow-hidden" data-table-container>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DataTable
                  data={displayData}
                  selectedId={selectedId}
                  onRowClick={handleRowClick}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        )}

        {(layoutMode === 'split' || layoutMode === 'map') && (
          <div className="border rounded-lg overflow-hidden bg-background flex flex-col min-h-0">
            <div className="p-2 border-b bg-muted/50">
              <h2 className="font-semibold text-sm">Map View</h2>
            </div>
            <div className="flex-1 relative min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <MapWrapper
                  data={displayData}
                  selectedId={selectedId}
                  selectedItem={selectedItem}
                  onMarkerClick={handleMarkerClick}
                  tileStyle={tileStyle}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

