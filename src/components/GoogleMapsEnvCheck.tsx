import React from 'react';

export default function GoogleMapsEnvCheck() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Google Maps API Configuration Check</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>API Key Status:</strong> {apiKey ? '✅ Found' : '❌ Missing'}
        </div>
        
        {apiKey && (
          <div>
            <strong>API Key Preview:</strong> {apiKey.substring(0, 10)}...{apiKey.substring(apiKey.length - 5)}
          </div>
        )}
        
        <div>
          <strong>Current Domain:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Server-side'}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <strong>Common Issues & Solutions:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Production:</strong> Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in Vercel/deployment environment</li>
            <li><strong>API Restrictions:</strong> In Google Console, ensure your domain is allowed</li>
            <li><strong>APIs Enabled:</strong> Enable &quot;Places API&quot; and &quot;Maps JavaScript API&quot;</li>
            <li><strong>Billing:</strong> Ensure billing is enabled for your Google Cloud project</li>
            <li><strong>Quotas:</strong> Check you haven&apos;t exceeded daily limits</li>
          </ul>
        </div>
        
        {!apiKey && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <strong>Next Steps:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to your Vercel dashboard → Project Settings → Environment Variables</li>
              <li>Add: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = your_api_key_here</li>
              <li>Redeploy your application</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
