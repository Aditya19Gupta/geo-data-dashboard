'use client';

import dynamic from 'next/dynamic';
import { GeoData } from '@/types';

const Map = dynamic(() => import('./Map').then((mod) => ({ default: mod.Map })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
      Loading map...
    </div>
  ),
});

import { MapTileStyle } from '@/types';

interface MapWrapperProps {
  data: GeoData[];
  selectedId: string | null;
  selectedItem: GeoData | null;
  onMarkerClick: (id: string) => void;
  tileStyle?: MapTileStyle;
}

export function MapWrapper(props: MapWrapperProps) {
  return <Map {...props} />;
}

