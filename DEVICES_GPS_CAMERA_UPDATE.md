# Devices Page Update - GPS Tracking & Camera Management

## Summary
Updated the Devices page to show GPS tracking devices attached to trucks with real-time location tracking, and added comprehensive camera management with tabs.

## New Implementation

### Tab Structure
The Devices page now has two tabs:

1. **GPS Tracking** - Track vehicles with GPS devices
2. **Cameras** - Manage ANPR and traffic cameras

## GPS Tracking Tab

### Purpose
Monitor trucks with GPS tracking devices attached, showing real-time location, speed, battery, and signal strength.

### Features

#### Stats Cards
- **Active Tracking:** 2 vehicles moving
- **Idle:** 1 vehicle stationary
- **Offline:** 1 device with no signal
- **Low Battery:** 1 device needs charging

#### Tracking Devices Table
Displays comprehensive information for each GPS device:

| Field | Description |
|-------|-------------|
| Device ID | Unique GPS device identifier (GPS-001, GPS-002, etc.) |
| Plate Number | Vehicle registration (AAA-123-MP format) |
| Vehicle Type | Cargo Truck, Heavy Truck, Tractor, Bus |
| Location | Current street address with map pin icon |
| Speed | Current speed in km/h with navigation icon |
| Battery | Battery percentage with visual indicator |
| Signal | Signal strength (Strong/Medium/Weak) with icon |
| Status | Active/Idle/Offline badge |
| Actions | View details button |

#### Mock Data (5 Devices)
1. **GPS-001** - AAA-123-MP (Cargo Truck)
   - Location: Av. Julius Nyerere & Mao Tse Tung
   - Speed: 45 km/h
   - Battery: 85%
   - Signal: Strong
   - Status: Active

2. **GPS-002** - BBB-456-MP (Heavy Truck)
   - Location: Av. 25 de Setembro
   - Speed: 32 km/h
   - Battery: 92%
   - Signal: Strong
   - Status: Active

3. **GPS-003** - CCC-789-MP (Tractor)
   - Location: Marginal Avenue
   - Speed: 0 km/h (Idle)
   - Battery: 67%
   - Signal: Medium
   - Status: Idle

4. **GPS-004** - DDD-012-MP (Bus)
   - Location: Av. Eduardo Mondlane
   - Speed: 28 km/h
   - Battery: 78%
   - Signal: Strong
   - Status: Active

5. **GPS-005** - EEE-345-MP (Heavy Truck)
   - Location: Last: Av. Acordos de Lusaka
   - Speed: N/A
   - Battery: 12% (Low)
   - Signal: Weak
   - Status: Offline

### Visual Indicators

#### Battery Icons
- **Green Battery** (>50%): Healthy charge
- **Red Battery Low** (<50%): Needs charging

#### Signal Icons
- **Signal High** (Strong): Green, full bars
- **Signal Medium** (Medium): Yellow, partial bars
- **Signal Low** (Weak): Red, minimal bars

#### Status Badges
- **Active**: Green - Vehicle moving
- **Idle**: Yellow - Vehicle stationary
- **Offline**: Red - No connection

### Actions
- **Search**: Filter by plate number or owner
- **View Map**: Button to view all devices on map
- **View Details**: Eye icon for individual device details

## Cameras Tab

### Purpose
Manage ANPR (Automatic Number Plate Recognition) and traffic monitoring cameras.

### Features

#### Stats Cards
- **Total Cameras:** 5 installed
- **Online:** 4 active cameras
- **Offline:** 1 camera needs attention
- **Today's Detections:** 6,689 plate readings

#### Camera Management Table
Displays comprehensive information for each camera:

| Field | Description |
|-------|-------------|
| Camera ID | Unique camera identifier (CAM-001, CAM-002, etc.) |
| Name | Descriptive camera name with location |
| Type | ANPR or Traffic camera |
| Location | Street address with map pin icon |
| Resolution | Video quality (4K, 1080p) |
| FPS | Frames per second |
| Detections | Total plate detections |
| Status | Online/Offline badge |
| Actions | View live feed button |

#### Mock Data (5 Cameras)
1. **CAM-001** - North Gate - Julius Nyerere
   - Type: ANPR
   - Resolution: 4K
   - FPS: 30
   - Detections: 1,234
   - Status: Online

2. **CAM-002** - South Gate - 25 de Setembro
   - Type: ANPR
   - Resolution: 4K
   - FPS: 30
   - Detections: 987
   - Status: Online

3. **CAM-003** - East Gate - Marginal
   - Type: ANPR
   - Resolution: 4K
   - FPS: 0 (Offline)
   - Detections: 756
   - Status: Offline

4. **CAM-004** - West Gate - Eduardo Mondlane
   - Type: Traffic
   - Resolution: 1080p
   - FPS: 25
   - Detections: 2,145
   - Status: Online

5. **CAM-005** - Central - Vladimir Lenine
   - Type: ANPR
   - Resolution: 4K
   - FPS: 30
   - Detections: 1,567
   - Status: Online

### Actions
- **Search**: Filter by camera name or location
- **Live Feed**: Button to view live camera feeds
- **View Details**: Eye icon for individual camera details

## Technical Implementation

### Components Used
- **Tabs**: For GPS Tracking and Cameras separation
- **Table**: For device and camera listings
- **Cards**: For stats and information display
- **Badges**: For status indicators
- **Icons**: Radio, MapPin, Navigation, Battery, Signal, Camera, Video, Eye

### Search Functionality
- GPS Tracking: Search by plate number or owner
- Cameras: Search by camera name or location
- Real-time filtering as user types

### Data Structure

#### GPS Device
```typescript
{
  id: string              // GPS-001
  plateNumber: string     // AAA-123-MP
  vehicleType: string     // Cargo Truck
  owner: string           // TransMoz Logistics
  status: string          // Active/Idle/Offline
  location: string        // Street address
  coordinates: string     // GPS coordinates
  speed: string           // km/h
  battery: string         // Percentage
  signal: string          // Strong/Medium/Weak
  lastUpdate: string      // Time ago
}
```

#### Camera
```typescript
{
  id: string              // CAM-001
  name: string            // North Gate - Julius Nyerere
  type: string            // ANPR/Traffic
  location: string        // Street address
  coordinates: string     // GPS coordinates
  status: string          // Online/Offline
  resolution: string      // 4K/1080p
  fps: string             // Frames per second
  detections: string      // Total count
  lastDetection: string   // Time ago
}
```

## Files Modified

**`src/pages/devices.tsx`**
- Complete rewrite with tabs
- Added GPS tracking devices table
- Added camera management table
- Added search functionality
- Added stats cards for both tabs
- Added visual indicators (battery, signal, status)

## Benefits

1. **Real-time Tracking**: Monitor truck locations and movement
2. **Device Health**: Battery and signal monitoring
3. **Camera Management**: Centralized ANPR and traffic camera oversight
4. **Search & Filter**: Quick device and camera lookup
5. **Visual Indicators**: Easy-to-understand status icons
6. **Comprehensive Stats**: Quick overview of device and camera status
7. **Scalability**: Easy to add more devices and cameras

## Use Cases

### GPS Tracking
- Monitor truck locations in real-time
- Identify idle or offline vehicles
- Track battery levels for maintenance
- Verify vehicle routes and speeds
- Detect signal issues

### Camera Management
- Monitor ANPR camera status
- Track plate detection counts
- Identify offline cameras
- View camera specifications
- Access live feeds

## Verification

✅ No TypeScript errors
✅ Tabs working correctly
✅ Search functionality implemented
✅ Mock data with Mozambique plates
✅ Visual indicators functional
✅ Stats cards accurate
✅ Responsive layout
