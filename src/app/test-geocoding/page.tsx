'use client';

import { useState } from 'react';
import { reverseGeocodeClient, type GeocodeResult } from '@/lib/client-geocoding';

export default function TestGeocodingPage() {
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test coordinates for Banja Luka
  const testCoordinates = [
    { lat: 44.774250, lng: 17.188152, name: 'Banja Luka City Center' },
    { lat: 44.7866, lng: 17.2066, name: 'Banja Luka Airport Area' },
    { lat: 43.8563, lng: 18.4131, name: 'Sarajevo' },
    { lat: 45.8150, lng: 16.0600, name: 'Zagreb' }
  ];

  const testGeocode = async (lat: number, lng: number, locationName: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Testing geocoding for ${locationName}: ${lat}, ${lng}`);
      
      const geocodeResult = await reverseGeocodeClient(lat, lng);
      console.log('Geocode result:', geocodeResult);
      setResult(geocodeResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Geocoding Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Test Coordinates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testCoordinates.map((coord, index) => (
            <button
              key={index}
              onClick={() => testGeocode(coord.lat, coord.lng, coord.name)}
              disabled={loading}
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-left"
            >
              <div className="font-semibold">{coord.name}</div>
              <div className="text-sm opacity-90">{coord.lat}, {coord.lng}</div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span>Geocoding location...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-4">Geocoding Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Display Name</h4>
              <p className="text-lg font-semibold text-green-700">{result.display_name}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Source</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                result.source === 'google' ? 'bg-green-100 text-green-800' :
                result.source === 'cache' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {result.source}
              </span>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Coordinates</h4>
              <p>{result.lat}, {result.lon}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Address Components</h4>
              <div className="space-y-1 text-sm">
                {result.address.city && <p><strong>City:</strong> {result.address.city}</p>}
                {result.address.country && <p><strong>Country:</strong> {result.address.country}</p>}
                {result.address.full_address && (
                  <p><strong>Full Address:</strong> {result.address.full_address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">About This Test</h3>
        <p className="text-sm text-gray-600 mb-3">
          This page tests the client-side geocoding service that bypasses HTTP referrer restrictions 
          on Google Maps API keys. It should return proper addresses instead of raw coordinates.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> If you just updated Google Cloud Console referrer restrictions, 
            changes can take 5-10 minutes to propagate. If you&apos;re seeing &quot;fallback&quot; results, 
            please wait a few minutes and try again.
          </p>
        </div>
      </div>
    </div>
  );
}