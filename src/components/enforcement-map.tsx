import { useEffect, useRef } from "react"
import L from "leaflet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle } from "lucide-react"

// ── Real Maputo coordinates ──────────────────────────────────────────────────
// Centre of Maputo city
const MAPUTO_CENTER: [number, number] = [-25.9692, 32.5732]
const DEFAULT_ZOOM = 14

// Enforcement actions — real Maputo street coordinates
const ENFORCEMENT_POINTS = [
  {
    id: "ENF-001",
    plateNumber: "AAA-123-MP",
    offenceType: "Operating Without Valid RUC Payment",
    action: "Vehicle Impounded",
    officer: "Officer Silva",
    timestamp: "14:23",
    location: "Av. Julius Nyerere & Mao Tse Tung",
    latlng: [-25.9612, 32.5823] as [number, number],
  },
  {
    id: "ENF-002",
    plateNumber: "BBB-456-MP",
    offenceType: "Overweight Vehicle",
    action: "Fine Issued",
    officer: "Officer Macamo",
    timestamp: "13:45",
    location: "Av. 25 de Setembro",
    latlng: [-25.9655, 32.5731] as [number, number],
  },
  {
    id: "ENF-003",
    plateNumber: "CCC-789-MP",
    offenceType: "Operating During Restricted Hours",
    action: "Vehicle Impounded",
    officer: "Officer Nhantumbo",
    timestamp: "12:10",
    location: "Marginal Avenue",
    latlng: [-25.9701, 32.5945] as [number, number],
  },
  {
    id: "ENF-004",
    plateNumber: "DDD-012-MP",
    offenceType: "Operating Without Road Closure Permit",
    action: "Warning Issued",
    officer: "Officer Costa",
    timestamp: "11:30",
    location: "Av. Eduardo Mondlane",
    latlng: [-25.9588, 32.5680] as [number, number],
  },
  {
    id: "ENF-005",
    plateNumber: "EEE-345-MP",
    offenceType: "Unauthorized Route Deviation",
    action: "Warning Issued",
    officer: "Officer Bila",
    timestamp: "10:15",
    location: "Av. Acordos de Lusaka",
    latlng: [-25.9723, 32.5834] as [number, number],
  },
  {
    id: "ENF-006",
    plateNumber: "FFF-678-MP",
    offenceType: "Damaged Road Infrastructure",
    action: "Fine Issued",
    officer: "Officer Tembe",
    timestamp: "09:30",
    location: "Av. Vladimir Lenine",
    latlng: [-25.9634, 32.5789] as [number, number],
  },
]

// Unenforced violations — detected but no action taken yet
const UNENFORCED_VIOLATIONS = [
  {
    id: "VIO-001",
    plateNumber: "HHH-234-MP",
    vehicleType: "Heavy Truck",
    owner: "Beira Freight Co.",
    violationType: "Overweight Vehicle",
    severity: "High" as const,
    location: "Av. Julius Nyerere & Av. Mao Tse Tung",
    detectedAt: "09:14",
    detectedBy: "CAM-001 (ANPR)",
    estimatedPenalty: "25,000 MZN",
    latlng: [-25.9580, 32.5860] as [number, number],
  },
  {
    id: "VIO-002",
    plateNumber: "III-567-MP",
    vehicleType: "Cargo Truck",
    owner: "Maputo Cargo Ltd",
    violationType: "Expired RUC Payment",
    severity: "High" as const,
    location: "Av. 25 de Setembro",
    detectedAt: "09:45",
    detectedBy: "CAM-002 (ANPR)",
    estimatedPenalty: "45,000 MZN",
    latlng: [-25.9670, 32.5710] as [number, number],
  },
  {
    id: "VIO-003",
    plateNumber: "JJJ-890-MP",
    vehicleType: "Bus",
    owner: "City Transit",
    violationType: "No Road Closure Permit",
    severity: "Medium" as const,
    location: "Av. Eduardo Mondlane",
    detectedAt: "10:02",
    detectedBy: "CAM-004 (Traffic)",
    estimatedPenalty: "20,000 MZN",
    latlng: [-25.9600, 32.5660] as [number, number],
  },
  {
    id: "VIO-004",
    plateNumber: "KKK-123-MP",
    vehicleType: "Tractor",
    owner: "Heavy Haul Services",
    violationType: "Restricted Hours Violation",
    severity: "High" as const,
    location: "Marginal Avenue",
    detectedAt: "10:30",
    detectedBy: "GPS-003",
    estimatedPenalty: "35,000 MZN",
    latlng: [-25.9720, 32.5960] as [number, number],
  },
  {
    id: "VIO-005",
    plateNumber: "LLL-456-MP",
    vehicleType: "Heavy Truck",
    owner: "Freight Masters",
    violationType: "Route Deviation",
    severity: "Low" as const,
    location: "Av. Vladimir Lenine",
    detectedAt: "10:55",
    detectedBy: "GPS-002",
    estimatedPenalty: "10,000 MZN",
    latlng: [-25.9640, 32.5800] as [number, number],
  },
]

// Heatmap hotspot zones (real Maputo intersections)
const HEATMAP_ZONES = [
  { latlng: [-25.9612, 32.5823] as [number, number], radius: 300, intensity: 0.7 },
  { latlng: [-25.9655, 32.5731] as [number, number], radius: 250, intensity: 0.6 },
  { latlng: [-25.9701, 32.5945] as [number, number], radius: 200, intensity: 0.5 },
  { latlng: [-25.9588, 32.5680] as [number, number], radius: 180, intensity: 0.45 },
  { latlng: [-25.9634, 32.5789] as [number, number], radius: 160, intensity: 0.4 },
  { latlng: [-25.9723, 32.5834] as [number, number], radius: 140, intensity: 0.35 },
]

// ── Colour helpers ────────────────────────────────────────────────────────────
const actionColor = (action: string) =>
  action === "Vehicle Impounded" ? "#E5533D"
  : action === "Fine Issued"     ? "#5B8C5A"
  :                                "#DAA22A"

const severityColor = (s: "High" | "Medium" | "Low") =>
  s === "High" ? "#E5533D" : s === "Medium" ? "#DAA22A" : "#5B8C5A"

// ── SVG circle icon factory ───────────────────────────────────────────────────
function circleIcon(color: string, pulse = false) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      ${pulse ? `<circle cx="14" cy="14" r="13" fill="${color}" opacity="0.25">
        <animate attributeName="r" values="10;14;10" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.6s" repeatCount="indefinite"/>
      </circle>` : ""}
      <circle cx="14" cy="14" r="9" fill="${color}" stroke="white" stroke-width="2.5"/>
      ${pulse ? `<path d="M14 9v5l3 2" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none"/>` :
               `<circle cx="14" cy="14" r="4" fill="white" opacity="0.8"/>`}
    </svg>`
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EnforcementMapProps {
  layer: "both" | "heatmap" | "violations"
  hoveredId: string | null
  onHover: (id: string | null) => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function EnforcementMap({ layer, hoveredId, onHover }: EnforcementMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const heatLayerRef = useRef<L.LayerGroup | null>(null)
  const enfLayerRef = useRef<L.LayerGroup | null>(null)
  const vioLayerRef = useRef<L.LayerGroup | null>(null)
  const vioMarkersRef = useRef<Map<string, L.Marker>>(new Map())

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: MAPUTO_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    })

    // OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // ── Heatmap layer (CSS radial circles via L.circle) ──────────────────────
    const heatLayer = L.layerGroup()
    HEATMAP_ZONES.forEach(({ latlng, radius, intensity }) => {
      // Outer glow
      L.circle(latlng, {
        radius,
        color: "transparent",
        fillColor: "#E5533D",
        fillOpacity: intensity * 0.25,
        interactive: false,
      }).addTo(heatLayer)
      // Inner core
      L.circle(latlng, {
        radius: radius * 0.45,
        color: "transparent",
        fillColor: "#E5533D",
        fillOpacity: intensity * 0.55,
        interactive: false,
      }).addTo(heatLayer)
    })
    heatLayerRef.current = heatLayer

    // ── Enforcement action markers ────────────────────────────────────────────
    const enfLayer = L.layerGroup()
    ENFORCEMENT_POINTS.forEach((pt) => {
      const color = actionColor(pt.action)
      const marker = L.marker(pt.latlng, { icon: circleIcon(color) })
      marker.bindPopup(`
        <div style="min-width:200px;font-family:inherit">
          <div style="background:${color};color:white;padding:6px 10px;border-radius:6px 6px 0 0;margin:-10px -10px 8px -10px">
            <strong>${pt.plateNumber}</strong>
            <span style="float:right;font-size:11px;opacity:.85">${pt.timestamp}</span>
          </div>
          <div style="font-size:12px;color:#555;margin-bottom:4px">${pt.offenceType}</div>
          <div style="font-size:12px;margin-bottom:2px">📍 ${pt.location}</div>
          <div style="font-size:12px;margin-bottom:2px">👮 ${pt.officer}</div>
          <div style="margin-top:6px">
            <span style="background:${color}22;color:${color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${pt.action}</span>
          </div>
        </div>
      `, { maxWidth: 260 })
      marker.addTo(enfLayer)
    })
    enfLayerRef.current = enfLayer

    // ── Unenforced violation markers ──────────────────────────────────────────
    const vioLayer = L.layerGroup()
    const vioMarkers = new Map<string, L.Marker>()

    UNENFORCED_VIOLATIONS.forEach((vio) => {
      const color = severityColor(vio.severity)
      const marker = L.marker(vio.latlng, { icon: circleIcon(color, true) })

      marker.bindPopup(`
        <div style="min-width:220px;font-family:inherit">
          <div style="background:${color};color:white;padding:6px 10px;border-radius:6px 6px 0 0;margin:-10px -10px 8px -10px;display:flex;justify-content:space-between;align-items:center">
            <strong>${vio.plateNumber}</strong>
            <span style="background:rgba(255,255,255,.25);padding:1px 6px;border-radius:3px;font-size:10px">${vio.severity}</span>
          </div>
          <div style="font-size:13px;font-weight:600;margin-bottom:4px">${vio.violationType}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:#555;margin-bottom:6px">
            <div><span style="color:#999">Vehicle</span><br/>${vio.vehicleType}</div>
            <div><span style="color:#999">Owner</span><br/>${vio.owner}</div>
            <div><span style="color:#999">Detected</span><br/>${vio.detectedAt}</div>
            <div><span style="color:#999">Source</span><br/>${vio.detectedBy}</div>
          </div>
          <div style="font-size:11px;color:#555;margin-bottom:6px">📍 ${vio.location}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #eee;padding-top:6px">
            <span style="font-size:11px;color:#888">Est. Penalty</span>
            <strong style="color:${color};font-size:14px">${vio.estimatedPenalty}</strong>
          </div>
          <div style="margin-top:6px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:4px;padding:4px 8px;text-align:center;font-size:11px;font-weight:600;color:#92400E">
            ⚠ Awaiting Enforcement
          </div>
        </div>
      `, { maxWidth: 280 })

      marker.on("mouseover", () => onHover(vio.id))
      marker.on("mouseout", () => onHover(null))
      marker.addTo(vioLayer)
      vioMarkers.set(vio.id, marker)
    })

    vioLayerRef.current = vioLayer
    vioMarkersRef.current = vioMarkers
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle layers when prop changes ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const showHeat = layer === "heatmap" || layer === "both"
    const showVio  = layer === "violations" || layer === "both"

    if (heatLayerRef.current) {
      showHeat ? heatLayerRef.current.addTo(map) : map.removeLayer(heatLayerRef.current)
    }
    if (enfLayerRef.current) {
      showHeat ? enfLayerRef.current.addTo(map) : map.removeLayer(enfLayerRef.current)
    }
    if (vioLayerRef.current) {
      showVio ? vioLayerRef.current.addTo(map) : map.removeLayer(vioLayerRef.current)
    }
  }, [layer])

  // ── Highlight hovered violation marker ────────────────────────────────────
  useEffect(() => {
    vioMarkersRef.current.forEach((marker, id) => {
      const vio = UNENFORCED_VIOLATIONS.find((v) => v.id === id)
      if (!vio) return
      const color = severityColor(vio.severity)
      const isActive = id === hoveredId
      marker.setIcon(circleIcon(color, true))
      if (isActive) {
        marker.openPopup()
      }
    })
  }, [hoveredId])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 0 }}
    />
  )
}

// ── Side-panel list (exported separately so statistics.tsx stays clean) ───────
export { UNENFORCED_VIOLATIONS, ENFORCEMENT_POINTS, severityColor, actionColor }
