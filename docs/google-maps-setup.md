# Google Maps API Configuration

To integrate Google Maps in your mojPoslic application, follow these steps:

## 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
5. Go to "APIs & Services" > "Credentials"
6. Create an API key and restrict it as needed (HTTP referrers recommended)

## 2. Configure Your Environment

Add your API key to your environment variables:

### Development Environment

Create or update your `.env.local` file in the project root:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Production Environment

Add the environment variable to your hosting platform (Vercel, etc.):

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 3. Billing and Usage

- Google Maps Platform offers a $200 monthly credit (enough for most small to medium applications)
- Keep track of your usage in the Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## API Usage Limits

| API | Free Tier | Paid Tier |
|-----|-----------|-----------|
| Geocoding API | $200 credit (~40,000 requests) | $5 per 1,000 requests |
| Places API | $200 credit (~20,000 requests) | $10-17 per 1,000 requests |

For detailed pricing, visit [Google Maps Platform Pricing](https://cloud.google.com/maps-platform/pricing)

## 4. Caching and Optimization

The application includes several optimization features to minimize API calls:

### Geocoding Cache
- **Persistent Cache**: Results are cached in localStorage for 30 days
- **City Coordinates**: Static city data is checked first to avoid API calls
- **Smart Fallbacks**: Graceful degradation when API limits are reached

### Search Optimization
- **Query Caching**: Search results are cached for 7 days
- **Static Data First**: Local city data is searched before making API calls
- **Debounced Requests**: Multiple rapid searches are optimized

### Map Component Optimization
- **Singleton LoadScript**: Google Maps script is loaded only once per session
- **Optimized Libraries**: Only necessary libraries (places) are loaded
- **Performance Settings**: Disabled unnecessary UI controls and optimized gesture handling

### Cache Management
```javascript
// Clear geocoding cache if needed
import { geocodeCache } from '@/lib/geocode-cache';
geocodeCache.clear();

// Get cache statistics
const stats = geocodeCache.getStats();
console.log('Cache stats:', stats);
```

## 5. Migration from Leaflet

All Leaflet dependencies have been removed and replaced with Google Maps:
- ✅ LocationPicker component migrated
- ✅ JobLocationMap component migrated  
- ✅ Optimized caching implemented
- ✅ Server-side proxy APIs created
