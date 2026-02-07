import { GeoData } from '@/types';

const API_BASE_URL = 'https://6986b1548bacd1d773eb8675.mockapi.io/api/geo-data';

export interface PaginatedResponse {
  data: GeoData[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchGeoData(
  page: number = 1,
  limit: number = 50,
  search?: string
): Promise<PaginatedResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch geo data');
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        page,
        limit,
      };
    }

    return {
      data: data.data || data,
      total: data.total || data.length || 0,
      page: data.page || page,
      limit: data.limit || limit,
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchAllGeoData(): Promise<GeoData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/get-all`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch geo data');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    throw error;
  }
}

