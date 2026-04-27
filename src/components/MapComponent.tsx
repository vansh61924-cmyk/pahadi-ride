
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';

interface MapComponentProps {
  pickup: Location | null;
  destination: Location | null;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ pickup, destination }) => {
  const defaultCenter: [number, number] = [31.1048, 77.1734]; // Shimla
  const defaultZoom = 13;

  useEffect(() => {
    // Fix for default marker icon using CDN
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden" id="map-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>Pickup: {pickup.name}</Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination: {destination.name}</Popup>
          </Marker>
        )}

        {(pickup || destination) ? (
          <ChangeView 
            center={destination ? [destination.lat, destination.lng] : (pickup ? [pickup.lat, pickup.lng] : defaultCenter)} 
            zoom={14} 
          />
        ) : null}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
