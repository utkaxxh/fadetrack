import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface LocationData {
  formatted: string;
  city: string;
  state: string;
  country: string;
  place_id?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, locationData?: LocationData) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  style?: React.CSSProperties;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function LocationAutocompleteDebug({
  value,
  onChange,
  placeholder = "Enter a location...",
  className = "",
  required = false,
  id,
  name,
  style,
  onFocus,
  onBlur
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (!inputRef.current) return;

      setIsLoading(true);
      setLoadingError(null);
      setDebugInfo('Starting initialization...');

      try {
        // Check if API key exists
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined');
        }
        setDebugInfo(`API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places"]
        });

        setDebugInfo('Loading Google Maps API...');
        await loader.load();
        setDebugInfo('Google Maps API loaded successfully');

        if (!inputRef.current) return;

        // Check if google.maps.places is available
        if (!window.google?.maps?.places) {
          throw new Error('Google Maps Places API not available');
        }
        setDebugInfo('Places API available, creating autocomplete...');

        // Initialize the autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'],
          fields: ['address_components', 'formatted_address', 'place_id', 'name']
        });

        setDebugInfo('Autocomplete created, adding listener...');

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.formatted_address) {
            // Extract city, state, country from address components
            let city = '';
            let state = '';
            let country = '';

            place.address_components?.forEach((component: google.maps.GeocoderAddressComponent) => {
              const types = component.types;
              if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('country')) {
                country = component.long_name;
              }
            });

            // Format as "City, State, Country" or use formatted_address as fallback
            let formattedLocation = place.formatted_address;
            if (city && state && country) {
              formattedLocation = `${city}, ${state}, ${country}`;
            }

            const locationData: LocationData = {
              formatted: formattedLocation,
              city,
              state,
              country,
              place_id: place.place_id
            };

            onChange(formattedLocation, locationData);
            setDebugInfo(`Place selected: ${formattedLocation}`);
          }
        });

        setDebugInfo('Autocomplete initialized successfully!');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Places API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoadingError(`Failed to load location suggestions: ${errorMessage}`);
        setDebugInfo(`Error: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={isLoading ? "Loading location suggestions..." : placeholder}
        className={className}
        required={required}
        id={id}
        name={name}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={isLoading}
      />
      
      {/* Debug Information */}
      <div className="absolute top-full left-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs z-10 max-w-md">
        <div><strong>Debug Info:</strong></div>
        <div>{debugInfo}</div>
        {loadingError && (
          <div className="text-red-600 mt-1">
            <strong>Error:</strong> {loadingError}
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}
