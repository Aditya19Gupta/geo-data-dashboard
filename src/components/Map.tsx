'use client';

import React, { useEffect, useRef, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { GeoData, MapTileStyle, LeafletIconPrototype, TileConfig } from '@/types';

delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  data: GeoData[];
  selectedId: string | null;
  selectedItem: GeoData | null;
  onMarkerClick: (id: string) => void;
  tileStyle?: MapTileStyle;
}

function MapViewUpdater({ 
  center, 
  zoom, 
  selectedItem 
}: { 
  center: [number, number]; 
  zoom: number;
  selectedItem: GeoData | null;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedItem) {
      map.setView(
        [selectedItem.latitude, selectedItem.longitude],
        15,
        { animate: true, duration: 0.5 }
      );
    } else {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, selectedItem]);

  return null;
}

// Memoized marker component for better performance
const MarkerMemo = memo(({ 
  item, 
  selectedId, 
  onMarkerClick, 
  defaultIcon, 
  selectedIcon,
  markersRef 
}: { 
  item: GeoData; 
  selectedId: string | null; 
  onMarkerClick: (id: string) => void;
  defaultIcon: L.Icon;
  selectedIcon: L.Icon;
  markersRef: React.MutableRefObject<{ [key: string]: L.Marker }>;
}) => {
  return (
    <Marker
      position={[item.latitude, item.longitude]}
      icon={item.id === selectedId ? selectedIcon : defaultIcon}
      eventHandlers={{
        click: () => onMarkerClick(item.id),
      }}
      ref={(ref) => {
        if (ref) {
          markersRef.current[item.id] = ref;
        }
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-sm">{item.projectName}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Status: {item.status}
          </p>
          <p className="text-xs text-muted-foreground">
            Lat: {item.latitude.toFixed(6)}, Lng: {item.longitude.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
});

MarkerMemo.displayName = 'MarkerMemo';

export const Map = memo(function Map({ data, selectedId, selectedItem, onMarkerClick, tileStyle = 'street' }: MapProps) {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Get tile layer URL and subdomains based on style
  const tileConfig = useMemo((): TileConfig => {
    switch (tileStyle) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          subdomains: ['a', 'b', 'c'],
        };
      case 'street':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: ['a', 'b', 'c'],
        };
    }
  }, [tileStyle]);

  const getTileAttribution = useMemo(() => {
    switch (tileStyle) {
      case 'satellite':
        return '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.esri.com/">Esri</a>';
      case 'terrain':
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      case 'dark':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      case 'street':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  }, [tileStyle]);

  const center: [number, number] = useMemo(() => {
    if (data.length === 0) {
      return [0, 0];
    }

    const avgLat =
      data.reduce((sum, item) => sum + item.latitude, 0) / data.length;
    const avgLng =
      data.reduce((sum, item) => sum + item.longitude, 0) / data.length;

    return [avgLat, avgLng];
  }, [data]);

  const defaultIcon = useMemo(
    () =>
      L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      }),
    []
  );

  const selectedIcon = useMemo(
    () =>
      L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [35, 55], // Larger icon for selected marker
        iconAnchor: [17, 55],
        popupAnchor: [1, -44],
        tooltipAnchor: [16, -38],
        shadowSize: [55, 55],
      }),
    []
  );

  useEffect(() => {
    Object.keys(markersRef.current).forEach((id) => {
      const marker = markersRef.current[id];
      if (marker) {
        marker.setIcon(id === selectedId ? selectedIcon : defaultIcon);
      }
    });
  }, [selectedId, defaultIcon, selectedIcon]);

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        No data to display on map
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={data.length === 1 ? 10 : 2}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      {tileConfig.subdomains ? (
        <TileLayer
          attribution={getTileAttribution}
          url={tileConfig.url}
          subdomains={tileConfig.subdomains}
        />
      ) : (
        <TileLayer
          attribution={getTileAttribution}
          url={tileConfig.url}
        />
      )}
      <MapViewUpdater 
        center={center} 
        zoom={data.length === 1 ? 10 : 2} 
        selectedItem={selectedItem}
      />
      {selectedItem && (
        <Circle
          center={[selectedItem.latitude, selectedItem.longitude]}
          radius={500} // 500 meters radius
          pathOptions={{
            color: '#ef4444', // Red color
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            weight: 3,
          }}
        />
      )}
      {data.map((item) => (
        <MarkerMemo
          key={item.id}
          item={item}
          selectedId={selectedId}
          onMarkerClick={onMarkerClick}
          defaultIcon={defaultIcon}
          selectedIcon={selectedIcon}
          markersRef={markersRef}
        />
      ))}
    </MapContainer>
  );
});

