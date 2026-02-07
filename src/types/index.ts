export interface GeoData {
  id: string;
  projectName: string;
  latitude: number;
  longitude: number;
  status: string;
  lastUpdated: string;
}

export interface ApiGeoDataResponse {
  id?: string;
  Id?: string;
  projectName?: string;
  ProjectName?: string;
  name?: string;
  latitude?: string | number;
  Latitude?: string | number;
  lat?: string | number;
  longitude?: string | number;
  Longitude?: string | number;
  lng?: string | number;
  lon?: string | number;
  status?: string;
  Status?: string;
  lastUpdated?: string;
  LastUpdated?: string;
  lastDdate?: string;
  updatedAt?: string;
}

export type SortField = 'projectName' | 'latitude' | 'longitude' | 'status' | 'lastUpdated';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

export type MapTileStyle = 'street' | 'satellite' | 'terrain' | 'dark';
export type LayoutMode = 'split' | 'table' | 'map';

export interface TileConfig {
  url: string;
  subdomains?: string[];
}

export interface LeafletIconPrototype {
  _getIconUrl?: (name: string) => string;
}

