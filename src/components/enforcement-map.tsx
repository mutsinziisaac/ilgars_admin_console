import { Map as GoogleMap, type MapCircle, type MapMarker } from "@/components/ui/map"
import { UGANDA_CENTER, UGANDA_OVERVIEW_ZOOM } from "@/lib/map-region"

const DEFAULT_ZOOM = UGANDA_OVERVIEW_ZOOM
const TRUCK_MARKER_IMAGE = "/truck-cargo-icon.png"

// Enforcement actions — real Maputo street coordinates
const ENFORCEMENT_POINTS = [
  {
    id: "ENF-001",
    plateNumber: "AAA-123-MP",
    offenceType: "Outstanding Payments",
    action: "Vehicle Impounded",
    officer: "Officer Silva",
    timestamp: "14:23",
    location: "Kampala Road & Bombo Road",
    latlng: [0.3182, 32.5779] as [number, number],
  },
  {
    id: "ENF-002",
    plateNumber: "BBB-456-MP",
    offenceType: "Overweight Vehicle",
    action: "Fine Issued",
    officer: "Officer Macamo",
    timestamp: "13:45",
    location: "Entebbe Road",
    latlng: [0.2607, 32.5504] as [number, number],
  },
  {
    id: "ENF-003",
    plateNumber: "CCC-789-MP",
    offenceType: "Expired Permit",
    action: "Vehicle Impounded",
    officer: "Officer Nhantumbo",
    timestamp: "12:10",
    location: "Jinja Road",
    latlng: [0.3316, 32.6163] as [number, number],
  },
  {
    id: "ENF-004",
    plateNumber: "DDD-012-MP",
    offenceType: "No Circulation License",
    action: "Warning Issued",
    officer: "Officer Costa",
    timestamp: "11:30",
    location: "Hoima Road",
    latlng: [0.3479, 32.5426] as [number, number],
  },
  {
    id: "ENF-005",
    plateNumber: "EEE-345-MP",
    offenceType: "Unauthorized Route",
    action: "Warning Issued",
    officer: "Officer Bila",
    timestamp: "10:15",
    location: "Northern Bypass",
    latlng: [0.3842, 32.6048] as [number, number],
  },
  {
    id: "ENF-006",
    plateNumber: "FFF-678-MP",
    offenceType: "Device Tampered",
    action: "Fine Issued",
    officer: "Officer Tembe",
    timestamp: "09:30",
    location: "Nakasero",
    latlng: [0.3184, 32.5869] as [number, number],
  },
]

type EnforcementSeverity = "High" | "Medium" | "Low"

export type EnforcementAlert = {
  id: string
  plateNumber: string
  vehicleType: string
  owner: string
  violationType: string
  severity: EnforcementSeverity
  location: string
  detectedAt: string
  detectedBy: string
  estimatedPenalty: string
  latlng: [number, number]
}

// Unenforced violations — detected but no action taken yet
const BASE_UNENFORCED_VIOLATIONS: EnforcementAlert[] = [
  {
    id: "VIO-001",
    plateNumber: "HHH-234-MP",
    vehicleType: "Heavy Truck",
    owner: "Beira Freight Co.",
    violationType: "Overweight Vehicle",
    severity: "High",
    location: "Kampala Road & Bombo Road",
    detectedAt: "09:14",
    detectedBy: "CAM-001 (ANPR)",
    estimatedPenalty: "25,000 MZN",
    latlng: [0.3182, 32.5779],
  },
  {
    id: "VIO-002",
    plateNumber: "III-567-MP",
    vehicleType: "Cargo Truck",
    owner: "Maputo Cargo Ltd",
    violationType: "Expired Permit",
    severity: "High",
    location: "Entebbe Road",
    detectedAt: "09:45",
    detectedBy: "CAM-002 (ANPR)",
    estimatedPenalty: "45,000 MZN",
    latlng: [0.2607, 32.5504],
  },
  {
    id: "VIO-003",
    plateNumber: "JJJ-890-MP",
    vehicleType: "Bus",
    owner: "City Transit",
    violationType: "No Circulation License",
    severity: "Medium",
    location: "Hoima Road",
    detectedAt: "10:02",
    detectedBy: "CAM-004 (Traffic)",
    estimatedPenalty: "20,000 MZN",
    latlng: [0.3479, 32.5426],
  },
  {
    id: "VIO-004",
    plateNumber: "KKK-123-MP",
    vehicleType: "Tractor",
    owner: "Heavy Haul Services",
    violationType: "Device Tampered",
    severity: "High",
    location: "Jinja Road",
    detectedAt: "10:30",
    detectedBy: "GPS-003",
    estimatedPenalty: "35,000 MZN",
    latlng: [0.3316, 32.6163],
  },
  {
    id: "VIO-005",
    plateNumber: "LLL-456-MP",
    vehicleType: "Heavy Truck",
    owner: "Freight Masters",
    violationType: "Unauthorized Route",
    severity: "Medium",
    location: "Nakasero",
    detectedAt: "10:55",
    detectedBy: "GPS-002",
    estimatedPenalty: "10,000 MZN",
    latlng: [0.3184, 32.5869],
  },
]

const generatedAlertTypes = [
  { violationType: "Outstanding Payments", severity: "High" as const, penalty: "45,000 MZN", source: "Payment engine" },
  { violationType: "Device Tampered", severity: "High" as const, penalty: "50,000 MZN", source: "GPS tracker" },
  { violationType: "Unauthorized Route", severity: "Medium" as const, penalty: "10,000 MZN", source: "GPS tracker" },
  { violationType: "Signal Lost", severity: "Medium" as const, penalty: "5,000 MZN", source: "GPS tracker" },
  { violationType: "National Road Geofence", severity: "Low" as const, penalty: "0 MZN", source: "Geofence engine" },
]

const generatedLocations = [
  { location: "Kampala Road", latlng: [0.3136, 32.5811] as [number, number] },
  { location: "Entebbe Road", latlng: [0.2607, 32.5504] as [number, number] },
  { location: "Hoima Road", latlng: [0.3479, 32.5426] as [number, number] },
  { location: "Jinja Road", latlng: [0.3316, 32.6163] as [number, number] },
  { location: "Nakasero", latlng: [0.3184, 32.5869] as [number, number] },
  { location: "Northern Bypass", latlng: [0.3842, 32.6048] as [number, number] },
]

export const UNENFORCED_VIOLATIONS: EnforcementAlert[] = [
  ...BASE_UNENFORCED_VIOLATIONS,
  ...Array.from({ length: 45 }, (_, index) => {
    const alertType = generatedAlertTypes[index % generatedAlertTypes.length]
    const place = generatedLocations[index % generatedLocations.length]
    const offset = Math.floor(index / generatedLocations.length)
    const minutes = 8 + index
    return {
      id: `VIO-${String(index + 6).padStart(3, "0")}`,
      plateNumber: `${String.fromCharCode(65 + (index % 20))}${String.fromCharCode(66 + (index % 18))}${String.fromCharCode(67 + (index % 16))}-${String(200 + index).padStart(3, "0")}-MP`,
      vehicleType: index % 3 === 0 ? "Heavy Truck" : index % 3 === 1 ? "Cargo Truck" : "Tractor",
      owner: index % 2 === 0 ? "Maputo Cargo Ltd" : "TransMoz Logistics",
      violationType: alertType.violationType,
      severity: alertType.severity,
      location: place.location,
      detectedAt: `11:${String(minutes % 60).padStart(2, "0")}`,
      detectedBy: alertType.source,
      estimatedPenalty: alertType.penalty,
      latlng: [place.latlng[0] + offset * 0.0006, place.latlng[1] + offset * 0.0005] as [number, number],
    }
  }),
]

const HEATMAP_ZONES = [
  { latlng: [0.3136, 32.5811] as [number, number], radius: 300, intensity: 0.7 },
  { latlng: [0.2607, 32.5504] as [number, number], radius: 250, intensity: 0.6 },
  { latlng: [0.3316, 32.6163] as [number, number], radius: 200, intensity: 0.5 },
  { latlng: [0.3479, 32.5426] as [number, number], radius: 180, intensity: 0.45 },
  { latlng: [0.3184, 32.5869] as [number, number], radius: 160, intensity: 0.4 },
  { latlng: [0.3842, 32.6048] as [number, number], radius: 140, intensity: 0.35 },
]

// ── Colour helpers ────────────────────────────────────────────────────────────
const actionColor = (action: string) =>
  action === "Vehicle Impounded" ? "#E5533D"
  : action === "Fine Issued"     ? "#5B8C5A"
  :                                "#DAA22A"

const severityColor = (s: EnforcementSeverity) =>
  s === "High" ? "#E5533D" : s === "Medium" ? "#DAA22A" : "#5B8C5A"

// ── Props ─────────────────────────────────────────────────────────────────────
interface EnforcementMapProps {
  layer: "both" | "heatmap" | "violations"
  hoveredId: string | null
  onHover: (id: string | null) => void
  selectedId?: string | null
  violations?: EnforcementAlert[]
  onSelect?: (id: string) => void
}

const scatterKey = ([lat, lng]: [number, number]) =>
  `${Math.round(lat * 100)}:${Math.round(lng * 100)}`

const scatterPosition = (
  [lat, lng]: [number, number],
  indexAtLocation: number,
  baseRadius = 0.0038,
): [number, number] => {
  if (indexAtLocation === 0) return [lat, lng]

  const goldenAngle = 2.399963229728653
  const angle = indexAtLocation * goldenAngle
  const radius = baseRadius + Math.sqrt(indexAtLocation) * 0.0018

  return [
    lat + Math.sin(angle) * radius,
    lng + Math.cos(angle) * radius,
  ]
}

// ── Component ─────────────────────────────────────────────────────────────────
export function EnforcementMap({
  layer,
  hoveredId,
  onHover,
  selectedId,
  violations = UNENFORCED_VIOLATIONS,
  onSelect,
}: EnforcementMapProps) {
  const showHeat = layer === "heatmap" || layer === "both"
  const showViolations = layer === "violations" || layer === "both"
  const heatCircles: MapCircle[] = showHeat
    ? HEATMAP_ZONES.flatMap(({ latlng, radius, intensity }) => [
        {
          center: latlng,
          radius,
          color: "#E5533D",
          fillOpacity: intensity * 0.25,
        },
        {
          center: latlng,
          radius: radius * 0.45,
          color: "#E5533D",
          fillOpacity: intensity * 0.55,
        },
      ])
    : []
  const scatterCounts = new Map<string, number>()
  const nextScatteredPosition = (position: [number, number], baseRadius?: number) => {
    const key = scatterKey(position)
    const countAtLocation = scatterCounts.get(key) ?? 0
    scatterCounts.set(key, countAtLocation + 1)
    return scatterPosition(position, countAtLocation, baseRadius)
  }

  const enforcementMarkers: MapMarker[] = showHeat
    ? ENFORCEMENT_POINTS.map((pt) => {
        const color = actionColor(pt.action)
        return {
          position: nextScatteredPosition(pt.latlng, 0.0048),
          label: pt.plateNumber,
          color,
          imageUrl: TRUCK_MARKER_IMAGE,
          popupHtml: `
            <div style="width:260px;font-family:Outfit,system-ui,sans-serif">
              <div style="background:${color};color:white;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px">
                <strong style="font-size:15px;line-height:1.1">${pt.plateNumber}</strong>
                <span style="font-size:11px;opacity:.85">${pt.timestamp}</span>
              </div>
              <div style="padding:12px">
                <div style="font-size:13px;font-weight:700;margin-bottom:6px">${pt.offenceType}</div>
                <div style="font-size:12px;color:#555;margin-bottom:4px">${pt.location}</div>
                <div style="font-size:12px;color:#555;margin-bottom:10px">${pt.officer}</div>
                <span style="display:inline-block;background:${color}22;color:${color};padding:3px 8px;border-radius:5px;font-size:11px;font-weight:700">${pt.action}</span>
              </div>
            </div>
          `,
        }
      })
    : []
  const violationMarkers: MapMarker[] = showViolations
    ? violations.map((vio) => {
        const markerPosition = nextScatteredPosition(vio.latlng)
        const color = severityColor(vio.severity)
        const active = vio.id === hoveredId || vio.id === selectedId

        return {
          position: markerPosition,
          label: vio.plateNumber,
          color,
          imageUrl: TRUCK_MARKER_IMAGE,
          active,
          onMouseEnter: () => onHover(vio.id),
          onMouseLeave: () => onHover(null),
          onClick: () => onSelect?.(vio.id),
          popupHtml: `
            <div style="width:320px;font-family:Outfit,system-ui,sans-serif;color:#1C1C1C">
              <div style="background:${color};color:white;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px">
                <strong style="font-size:16px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${vio.plateNumber}</strong>
                <span style="background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.28);padding:2px 8px;border-radius:5px;font-size:12px;line-height:1;font-weight:700">${vio.severity}</span>
              </div>
              <div style="padding:14px 14px 12px">
                <div style="font-size:18px;line-height:1.2;font-weight:800;margin-bottom:10px">${vio.violationType}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:18px;row-gap:8px;margin-bottom:10px">
                  <div>
                    <div style="font-size:12px;line-height:1;color:#8C8C8C">Vehicle</div>
                    <div style="font-size:14px;line-height:1.2;color:#4A4A4A;margin-top:3px">${vio.vehicleType}</div>
                  </div>
                  <div>
                    <div style="font-size:12px;line-height:1;color:#8C8C8C">Owner</div>
                    <div style="font-size:14px;line-height:1.2;color:#4A4A4A;margin-top:3px">${vio.owner}</div>
                  </div>
                  <div>
                    <div style="font-size:12px;line-height:1;color:#8C8C8C">Detected</div>
                    <div style="font-size:14px;line-height:1.2;color:#4A4A4A;margin-top:3px">${vio.detectedAt}</div>
                  </div>
                  <div>
                    <div style="font-size:12px;line-height:1;color:#8C8C8C">Source</div>
                    <div style="font-size:14px;line-height:1.2;color:#4A4A4A;margin-top:3px">${vio.detectedBy}</div>
                  </div>
                </div>
                <div style="font-size:14px;line-height:1.3;color:#555;margin-bottom:12px">${vio.location}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ECECEC;padding-top:10px;margin-bottom:10px">
                  <span style="font-size:13px;color:#7A7A7A">Est. Penalty</span>
                  <strong style="color:${color};font-size:18px;line-height:1">${vio.estimatedPenalty}</strong>
                </div>
                <div style="background:#FEF3C7;border:1px solid #F2CC58;border-radius:6px;padding:8px 10px;text-align:center;font-size:14px;line-height:1.1;font-weight:800;color:#8A3A0A">
                  Alert Enforcement
                </div>
              </div>
            </div>
          `,
        }
      })
    : []

  return (
    <GoogleMap
      center={UGANDA_CENTER}
      zoom={DEFAULT_ZOOM}
      markers={[...enforcementMarkers, ...violationMarkers]}
      circles={heatCircles}
      height="100%"
      className="h-full w-full"
      defaultView="street"
      activeMarkerZoom={15}
    />
  )
}

// ── Side-panel list (exported separately so enforcement.tsx stays clean) ──────
export { ENFORCEMENT_POINTS, severityColor, actionColor }
