# Devices Page - Leaflet Map Implementation

## Summary
Successfully updated the Devices page to use the same Leaflet map implementation as the Enforcement heat map, replacing the mock CSS-based map with a real interactive OpenStreetMap.

## Changes Made

### 1. **Updated Imports**
- Added `useEffect` and `useRef` from React
- Added Leaflet library: `import L from "leaflet"`
- Added Leaflet CSS: `import "leaflet/dist/leaflet.css"`

### 2. **Added Real Maputo Coordinates**
- Defined Maputo center: `[-25.9692, 32.5732]`
- Updated all mock devices with real `latlng` coordinates
- Updated all mock cameras with real `latlng` coordinates

### 3. **Created Leaflet Icon Helpers**
```typescript
- deviceIcon(status): Creates GPS device markers with color coding
  - Active: Green (#5B8C5A) with pulse animation
  - Idle: Yellow (#DAA22A)
  - Offline: Red (#E5533D)
  
- cameraIcon(status): Creates camera markers
  - Online: Green (#5B8C5A)
  - Offline: Red (#E5533D)
```

### 4. **Added Map Initialization**
- Created `mapContainerRef` and `mapRef` using `useRef`
- Implemented `useEffect` hook to initialize Leaflet map when modal opens
- Added OpenStreetMap tile layer
- Created markers for all GPS devices with popups showing:
  - Plate number, vehicle type, owner
  - Speed, battery, signal strength
  - Location and status
- Created markers for all cameras with popups showing:
  - Camera name, type, resolution, FPS
  - Detection count, last detection time
  - Location and status

### 5. **Updated Map Modal**
- Replaced mock CSS map with Leaflet container
- Added legend showing:
  - GPS Devices: Active, Idle, Offline counts
  - Cameras: Online, Offline counts
- Legend positioned top-right with z-index 1000

## Features

### Interactive Map
✅ Real OpenStreetMap tiles from OpenStreetMap.org
✅ Zoom and pan controls
✅ Attribution to OpenStreetMap contributors

### GPS Device Markers
✅ Color-coded by status (Green/Yellow/Red)
✅ Pulse animation for Active devices
✅ Click to view detailed popup
✅ Shows real-time data: speed, battery, signal

### Camera Markers
✅ Color-coded by status (Green/Red)
✅ Camera icon design
✅ Click to view detailed popup
✅ Shows resolution, FPS, detections

### Real Coordinates
All devices positioned at actual Maputo locations:
- Av. Julius Nyerere & Mao Tse Tung
- Av. 25 de Setembro
- Marginal Avenue
- Av. Eduardo Mondlane
- Av. Acordos de Lusaka
- Av. Vladimir Lenine

## Technical Details

### Dependencies
- Leaflet: ^1.9.4 (already installed)
- React hooks: useState, useEffect, useRef

### Map Configuration
- Center: Maputo city center (-25.9692, 32.5732)
- Default zoom: 14
- Max zoom: 19
- Tile provider: OpenStreetMap

### Cleanup
- Map properly disposed on modal close
- Prevents memory leaks with cleanup function in useEffect

## Testing Checklist
- [ ] Map loads when "View Map" button is clicked
- [ ] All 5 GPS devices appear on map
- [ ] All 5 cameras appear on map
- [ ] Active devices show pulse animation
- [ ] Clicking markers shows popups with device info
- [ ] Legend shows correct counts
- [ ] Map can be zoomed and panned
- [ ] Modal closes properly
- [ ] No console errors

## Files Modified
- `src/pages/devices.tsx`

## Implementation Matches
This implementation follows the exact same pattern as:
- `src/pages/statistics.tsx` (Enforcement page)
- `src/components/enforcement-map.tsx`

Both now use Leaflet with OpenStreetMap tiles for consistent map experience across the application.
