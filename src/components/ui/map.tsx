import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    label: string
    description?: string
  }>
  route?: Array<[number, number]>
  height?: string
  className?: string
  defaultView?: "street" | "satellite"
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

export function Map({
  center = [-25.9655, 32.5832], // Maputo coordinates
  zoom = 13,
  markers = [],
  route = [],
  height = "400px",
  className = "",
  defaultView = "satellite",
}: MapProps) {
  return (
    <div className={className} style={{ height, width: "100%", borderRadius: "8px", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        <LayersControl position="topright">
          {/* ESRI World Imagery - High quality satellite */}
          <LayersControl.BaseLayer checked={defaultView === "satellite"} name="Satellite (ESRI)">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Google Satellite */}
          <LayersControl.BaseLayer name="Satellite (Google)">
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Google Hybrid - Satellite with labels */}
          <LayersControl.BaseLayer name="Hybrid (Google)">
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* OpenStreetMap - Street view */}
          <LayersControl.BaseLayer checked={defaultView === "street"} name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* CartoDB Positron - Clean minimal map */}
          <LayersControl.BaseLayer name="Minimal">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* CartoDB Dark Matter - Dark theme map */}
          <LayersControl.BaseLayer name="Dark">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* OpenTopoMap - Topographic map */}
          <LayersControl.BaseLayer name="Topographic">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Markers */}
        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            <Popup>
              <div>
                <strong>{marker.label}</strong>
                {marker.description && <p className="text-sm mt-1">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polyline */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "#4A90E2",
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
