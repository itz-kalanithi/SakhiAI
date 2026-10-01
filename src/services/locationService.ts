import { LanguageCode } from '../types';

export interface LocationData {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  isPermissionGranted: boolean;
  accuracyMeters?: number;
}

const INDIAN_STATES_PRESETS = [
  { state: 'Tamil Nadu', language: 'ta' as LanguageCode, defaultLat: 13.0827, defaultLng: 80.2707 },
  { state: 'Andhra Pradesh / Telangana', language: 'te' as LanguageCode, defaultLat: 17.3850, defaultLng: 78.4867 },
  { state: 'Uttar Pradesh / Delhi (NCR)', language: 'hi' as LanguageCode, defaultLat: 28.6139, defaultLng: 77.2090 },
  { state: 'Kerala', language: 'ml' as LanguageCode, defaultLat: 8.5241, defaultLng: 76.9366 },
  { state: 'Karnataka', language: 'kn' as LanguageCode, defaultLat: 12.9716, defaultLng: 77.5946 },
  { state: 'West Bengal', language: 'bn' as LanguageCode, defaultLat: 22.5726, defaultLng: 88.3639 },
  { state: 'Maharashtra', language: 'hi' as LanguageCode, defaultLat: 19.0760, defaultLng: 72.8777 },
];

class LocationService {
  private currentLocation: LocationData = {
    latitude: 13.0827,
    longitude: 80.2707,
    state: 'Tamil Nadu',
    district: 'Chennai',
    isPermissionGranted: false,
  };

  public async requestLocationPermission(): Promise<LocationData> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by browser.');
      return this.currentLocation;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const inferred = this.inferStateFromCoordinates(lat, lng);

          this.currentLocation = {
            latitude: lat,
            longitude: lng,
            state: inferred.state,
            district: inferred.district,
            accuracyMeters: position.coords.accuracy,
            isPermissionGranted: true,
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.warn('User denied or geolocation error:', error.message);
          this.currentLocation.isPermissionGranted = false;
          resolve(this.currentLocation);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  public setManualState(stateName: string) {
    const match = INDIAN_STATES_PRESETS.find(p => p.state.toLowerCase() === stateName.toLowerCase());
    if (match) {
      this.currentLocation = {
        ...this.currentLocation,
        state: match.state,
        district: 'District HQ',
        latitude: match.defaultLat,
        longitude: match.defaultLng,
      };
    } else {
      this.currentLocation.state = stateName;
    }
  }

  public getCurrentLocation(): LocationData {
    return this.currentLocation;
  }

  public getSuggestedLanguage(): LanguageCode {
    const match = INDIAN_STATES_PRESETS.find(p => p.state === this.currentLocation.state);
    return match ? match.language : 'ta';
  }

  public generateEmergencySosMessage(name: string = 'A woman'): string {
    const mapUrl = `https://maps.google.com/?q=${this.currentLocation.latitude},${this.currentLocation.longitude}`;
    return `🚨 EMERGENCY ALERT: ${name} is in immediate danger and needs urgent help!
Location: ${this.currentLocation.district}, ${this.currentLocation.state}
Live GPS Location: ${mapUrl}
Sent via SakhiAI Emergency SOS`;
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   */
  public calculateDistanceKm(lat2: number, lon2: number): number {
    const lat1 = this.currentLocation.latitude;
    const lon1 = this.currentLocation.longitude;
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private inferStateFromCoordinates(lat: number, lng: number): { state: string; district: string } {
    // Approximate bounding boxes for key Indian regions
    if (lat >= 8.0 && lat <= 13.5 && lng >= 76.0 && lng <= 80.5) {
      return { state: 'Tamil Nadu', district: 'Chennai / District' };
    }
    if (lat >= 14.0 && lat <= 19.5 && lng >= 77.0 && lng <= 84.0) {
      return { state: 'Andhra Pradesh / Telangana', district: 'Hyderabad / Amaravati' };
    }
    if (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) {
      return { state: 'Karnataka', district: 'Bengaluru / District' };
    }
    if (lat >= 8.2 && lat <= 12.8 && lng >= 74.8 && lng <= 77.5) {
      return { state: 'Kerala', district: 'Thiruvananthapuram / Kochi' };
    }
    if (lat >= 21.5 && lat <= 27.5 && lng >= 85.5 && lng <= 89.9) {
      return { state: 'West Bengal', district: 'Kolkata / District' };
    }
    if (lat >= 25.0 && lat <= 30.5 && lng >= 77.0 && lng <= 84.5) {
      return { state: 'Uttar Pradesh / Delhi (NCR)', district: 'Delhi / Lucknow' };
    }
    return { state: 'Tamil Nadu', district: 'Local District' };
  }
}

export const locationService = new LocationService();
export const AVAILABLE_STATES = INDIAN_STATES_PRESETS.map(s => s.state);
