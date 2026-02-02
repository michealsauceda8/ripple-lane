/**
 * Geolocation Service
 * Get user's IP address, country, and city information
 */

export interface GeolocationData {
  ip: string;
  country: string;
  city: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
}

/**
 * Get user's geolocation data
 * Uses ip-api.com (free tier, 45 requests/minute)
 */
export async function getUserGeolocation(): Promise<GeolocationData | null> {
  try {
    // Using ip-api.com free API
    const response = await fetch('https://ip-api.com/json/', {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Failed to fetch geolocation data');
      return null;
    }

    const data = await response.json();

    if (data.status === 'fail') {
      console.error('Geolocation API error:', data.message);
      return null;
    }

    return {
      ip: data.query || 'Unknown',
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      region: data.regionName || undefined,
      timezone: data.timezone || undefined,
      latitude: data.lat || undefined,
      longitude: data.lon || undefined,
      isp: data.isp || undefined,
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
}

/**
 * Get user IP from alternative service (cloudflare)
 * Fallback if primary fails
 */
export async function getUserIPAddress(): Promise<string> {
  try {
    const response = await fetch('https://cloudflare.com/cdn-cgi/trace');
    const text = await response.text();
    const lines = text.split('\n');
    const ipLine = lines.find(line => line.startsWith('ip='));
    return ipLine ? ipLine.split('=')[1] : 'Unknown';
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'Unknown';
  }
}

/**
 * Get detailed geolocation info with fallbacks
 */
export async function getFullGeolocationData(): Promise<GeolocationData> {
  let geo = await getUserGeolocation();

  if (!geo) {
    // Fallback to just getting IP
    const ip = await getUserIPAddress();
    geo = {
      ip,
      country: 'Unknown',
      city: 'Unknown',
    };
  }

  return geo;
}
