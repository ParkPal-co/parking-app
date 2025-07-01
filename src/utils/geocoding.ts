/**
 * src/utils/geocoding.ts
 * Utility functions for geocoding addresses using Google Maps API
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface VerifiedAddress extends AddressComponents {
  formattedAddress: string;
  coordinates: Coordinates;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export const verifyAndGeocodeAddress = async (address: AddressComponents): Promise<VerifiedAddress> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured in .env file (VITE_GOOGLE_MAPS_API_KEY)');
  }

  const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      formattedAddress
    )}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error_message) {
      throw new Error(`Google Maps API Error: ${data.error_message}`);
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`No results found for address: ${formattedAddress}. Status: ${data.status}`);
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    // Extract verified address components
    const streetNumber = result.address_components.find((c: GoogleAddressComponent) => c.types.includes('street_number'))?.long_name || '';
    const route = result.address_components.find((c: GoogleAddressComponent) => c.types.includes('route'))?.long_name || '';
    const city = result.address_components.find((c: GoogleAddressComponent) => c.types.includes('locality'))?.long_name || '';
    const state = result.address_components.find((c: GoogleAddressComponent) => c.types.includes('administrative_area_level_1'))?.short_name || '';
    const zipCode = result.address_components.find((c: GoogleAddressComponent) => c.types.includes('postal_code'))?.long_name || '';

    const verifiedAddress = {
      street: streetNumber ? `${streetNumber} ${route}` : route,
      city,
      state,
      zipCode,
      formattedAddress: result.formatted_address,
      coordinates: { lat, lng }
    };

    return verifiedAddress;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred during geocoding');
    }
  }
}; 