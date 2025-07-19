// Global Google Maps script loader to prevent multiple script loads
declare global {
  interface Window {
    google?: {
      maps?: {
        Map: unknown;
        Marker: unknown;
        InfoWindow: unknown;
        event?: { clearInstanceListeners: (instance: unknown) => void };
        places?: {
          PlacesService: unknown;
          AutocompleteService: unknown;
          Geocoder: unknown;
        };
      };
    };
    initGoogleMaps?: () => void;
    googleMapsLoaded?: boolean;
  }
}

let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // If already loaded, return immediately
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Create new load promise
  loadPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key is missing'));
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          window.googleMapsLoaded = true;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Set up callback before creating script
    window.initGoogleMaps = () => {
      window.googleMapsLoaded = true;
      resolve();
    };

    // Create script element with proper async loading
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Handle script load errors
    script.onerror = () => {
      console.error('Google Maps script failed to load');
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    // Add script to DOM
    document.head.appendChild(script);
  });

  return loadPromise;
}

export const isGoogleMapsLoaded = (): boolean => {
  const hasWindow = typeof window !== 'undefined';
  const hasGoogle = hasWindow && Boolean(window.google);
  const hasMaps = hasGoogle && Boolean(window.google?.maps);
  const hasMapConstructor = hasMaps && Boolean(window.google?.maps?.Map);
  const hasFlagSet = hasWindow && Boolean(window.googleMapsLoaded);
  
  // Check if we have the essential Google Maps API available
  // We don't strictly need the flag if the API is available
  return hasMapConstructor && (hasFlagSet || hasMaps);
};
