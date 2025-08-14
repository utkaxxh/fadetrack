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

export default function LocationAutocomplete({
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

  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (!inputRef.current) return;

      setIsLoading(true);
      setLoadingError(null);

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();

        if (!inputRef.current) return;

        // Initialize the autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'],
          fields: ['address_components', 'formatted_address', 'place_id', 'name']
        });

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
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Places API:', error);
        setLoadingError('Failed to load location suggestions');
        setIsLoading(false);
      }
    };

    // Check if Google Maps API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setLoadingError('Google Maps API key not configured');
      return;
    }

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
      
      {loadingError && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs z-10">
          {loadingError}
        </div>
      )}
      
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
