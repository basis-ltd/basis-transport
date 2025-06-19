import { environment } from '@/constants/environment.constants';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import MapDirections from './MapDirections';

interface MapViewProps {
  width?: string;
  height?: string;
  center?: { lat: number; lng: number };
  defaultCenter?: { lat: number; lng: number };
  zoom?: number;
  defaultZoom?: number;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  fromLabel?: string;
  toLabel?: string;
}

const MapView = ({
  width = '100%',
  height = '80vh',
  center,
  defaultCenter = { lat: -1.9568735750481734, lng: 30.085627934988924 },
  defaultZoom = 9,
  zoom,
  origin,
  destination,
  fromLabel,
  toLabel,
}: MapViewProps) => {
  return (
    <APIProvider apiKey={environment.googleMapsApiKey}>
      <Map
        style={{ width, height, position: 'relative' }}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        center={center || defaultCenter}
        gestureHandling={'greedy'}
        zoom={zoom}
        fullscreenControl={true}
      >
        {origin && destination && (
          <>
            <MapDirections
              origin={origin}
              destination={destination}
              fromLabel={fromLabel}
              toLabel={toLabel}
            />
            <Marker 
              position={origin}
              title={fromLabel}
            />
            <Marker 
              position={destination}
              title={toLabel}
            />
          </>
        )}
      </Map>
    </APIProvider>
  );
};

export default MapView;
