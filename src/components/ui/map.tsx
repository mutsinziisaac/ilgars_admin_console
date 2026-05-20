import { useEffect, useRef, useState } from "react"
import { UGANDA_CENTER } from "@/lib/map-region"

type GoogleMapsNamespace = any
type GoogleMapInstance = any
type GoogleMapsOverlay = { setMap: (map: GoogleMapInstance | null) => void }
type GoogleMapsListener = { remove: () => void }
type MapPopupOverlay = GoogleMapsOverlay & {
  show: (position: LatLngTuple, content: string) => void
  hide: () => void
}

export type LatLngTuple = [number, number]

export type MapMarker = {
  position: LatLngTuple
  label: string
  description?: string
  popupHtml?: string
  color?: string
  shape?: "circle" | "truck"
  imageUrl?: string
  glyph?: string
  active?: boolean
  draggable?: boolean
  onClick?: () => void
  onDragEnd?: (position: LatLngTuple) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export type MapCircle = {
  center: LatLngTuple
  radius: number
  color?: string
  fillOpacity?: number
  strokeOpacity?: number
}

interface MapProps {
  center?: LatLngTuple
  zoom?: number
  markers?: MapMarker[]
  route?: LatLngTuple[]
  polygons?: LatLngTuple[][]
  circles?: MapCircle[]
  height?: string
  className?: string
  defaultView?: "street" | "satellite"
  fitToBounds?: boolean
  activeMarkerZoom?: number
  routeColor?: string
  polygonStrokeColor?: string
  polygonFillColor?: string
  onMapClick?: (position: LatLngTuple) => void
}

interface EditableGoogleMapProps {
  points: LatLngTuple[]
  onPointsChange: (points: LatLngTuple[]) => void
  shape: "line" | "polygon"
  lineMode?: "straight" | "smooth"
  center?: LatLngTuple
  zoom?: number
  height?: string
  className?: string
  markerColor?: string
  strokeColor?: string
  fillColor?: string
  fitToBounds?: boolean
}

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-javascript-api"
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const MAP_LOAD_ERROR = "Add VITE_GOOGLE_MAPS_API_KEY to .env.local to load Google Maps."

let googleMapsPromise: Promise<GoogleMapsNamespace> | null = null

const browserWindow = () => window as Window & { google?: { maps?: GoogleMapsNamespace } }

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

const waitForGoogleMapsNamespace = () =>
  new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const existingMaps = browserWindow().google?.maps
    if (existingMaps) {
      resolve(existingMaps)
      return
    }

    const startedAt = window.performance.now()
    const poll = window.setInterval(() => {
      const maps = browserWindow().google?.maps
      if (maps) {
        window.clearInterval(poll)
        resolve(maps)
        return
      }

      if (window.performance.now() - startedAt > 10000) {
        window.clearInterval(poll)
        reject(new Error("Google Maps failed to initialize."))
      }
    }, 50)
  })

const loadGoogleMapsNamespace = async () => {
  const maps = await waitForGoogleMapsNamespace()
  let mapsLibrary = {}
  let markerLibrary = {}

  if (typeof maps.importLibrary === "function") {
    mapsLibrary = await maps.importLibrary("maps")
    markerLibrary = await maps.importLibrary("marker")
  }

  const mapsApi = Object.assign(Object.create(maps), mapsLibrary, markerLibrary)

  if (typeof mapsApi.Map !== "function") {
    throw new Error("Google Maps failed to initialize.")
  }

  return mapsApi
}

const getGoogleMapsApi = () => {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error(MAP_LOAD_ERROR))
  }

  if (browserWindow().google?.maps) {
    return loadGoogleMapsNamespace()
  }

  if (googleMapsPromise) return googleMapsPromise

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      loadGoogleMapsNamespace().then(resolve).catch(reject)
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load.")))
      return
    }

    const script = document.createElement("script")
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      v: "weekly",
      loading: "async",
    })

    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.defer = true
    script.onload = () => loadGoogleMapsNamespace().then(resolve).catch(reject)
    script.onerror = () => reject(new Error("Google Maps failed to load."))
    document.head.appendChild(script)
  })

  googleMapsPromise.catch(() => {
    googleMapsPromise = null
  })

  return googleMapsPromise
}

const toLatLngLiteral = ([lat, lng]: LatLngTuple) => ({ lat, lng })

const createSmoothLinePath = (points: LatLngTuple[], segmentsPerCurve = 12) => {
  if (points.length < 3) return points

  const smoothed: LatLngTuple[] = []

  for (let index = 0; index < points.length - 1; index += 1) {
    const [p0Lat, p0Lng] = points[Math.max(index - 1, 0)]
    const [p1Lat, p1Lng] = points[index]
    const [p2Lat, p2Lng] = points[index + 1]
    const [p3Lat, p3Lng] = points[Math.min(index + 2, points.length - 1)]

    for (let step = 0; step < segmentsPerCurve; step += 1) {
      const t = step / segmentsPerCurve
      const t2 = t * t
      const t3 = t2 * t
      const lat = 0.5 * (
        2 * p1Lat +
        (-p0Lat + p2Lat) * t +
        (2 * p0Lat - 5 * p1Lat + 4 * p2Lat - p3Lat) * t2 +
        (-p0Lat + 3 * p1Lat - 3 * p2Lat + p3Lat) * t3
      )
      const lng = 0.5 * (
        2 * p1Lng +
        (-p0Lng + p2Lng) * t +
        (2 * p0Lng - 5 * p1Lng + 4 * p2Lng - p3Lng) * t2 +
        (-p0Lng + 3 * p1Lng - 3 * p2Lng + p3Lng) * t3
      )

      smoothed.push([lat, lng])
    }
  }

  smoothed.push(points[points.length - 1])
  return smoothed
}

const getMapTypeId = (view: MapProps["defaultView"]) => view === "satellite" ? "hybrid" : "roadmap"

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const createPopupContent = (marker: MapMarker) =>
  marker.popupHtml ??
  `<div style="min-width:180px;padding:12px 14px;font-family:Outfit,system-ui,sans-serif">
    <strong>${escapeHtml(marker.label)}</strong>
    ${marker.description ? `<p style="margin:4px 0 0;color:#555;font-size:12px">${escapeHtml(marker.description)}</p>` : ""}
  </div>`

const createMarkerIcon = (maps: GoogleMapsNamespace, marker: MapMarker) => {
  const color = marker.color ?? "#4FAF7C"
  const scale = marker.active ? 11 : 8

  if (marker.imageUrl) {
    const width = marker.active ? 62 : 50
    const height = marker.active ? 43 : 35

    return {
      url: marker.imageUrl,
      scaledSize: new maps.Size(width, height),
      anchor: new maps.Point(width / 2, height / 2),
    }
  }

  if (marker.shape === "truck") {
    const size = marker.active ? 42 : 34
    const truckSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="16" fill="${color}" stroke="#ffffff" stroke-width="${marker.active ? 4 : 3}"/>
        <g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(6 8)">
          <path d="M9 14h4V3H1v11h2"/>
          <path d="M13 14h1"/>
          <path d="M19 14h2V9l-3-4h-5"/>
          <path d="M1 10h12"/>
          <circle cx="6" cy="14" r="2"/>
          <circle cx="17" cy="14" r="2"/>
        </g>
      </svg>
    `.trim()

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(truckSvg)}`,
      scaledSize: new maps.Size(size, size),
      anchor: new maps.Point(size / 2, size / 2),
    }
  }

  return {
    path: maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: marker.active ? 4 : 2.5,
    scale,
  }
}

const extendBounds = (maps: GoogleMapsNamespace, bounds: any, point: LatLngTuple) => {
  bounds.extend(new maps.LatLng(point[0], point[1]))
}

const createPopupOverlay = (maps: GoogleMapsNamespace, map: GoogleMapInstance): MapPopupOverlay => {
  const overlay = new maps.OverlayView() as MapPopupOverlay & {
    draw: () => void
    getPanes: () => any
    getProjection: () => any
    onAdd: () => void
    onRemove: () => void
  }
  const container = document.createElement("div")
  const card = document.createElement("div")
  const pointer = document.createElement("div")
  let position = new maps.LatLng(0, 0)
  let isVisible = false

  Object.assign(container.style, {
    display: "none",
    left: "0",
    maxWidth: "min(360px, calc(100vw - 40px))",
    pointerEvents: "none",
    position: "absolute",
    top: "0",
    transform: "translate(-50%, calc(-100% - 18px))",
    zIndex: "10000",
  })

  Object.assign(card.style, {
    background: "#ffffff",
    border: "1px solid rgba(28, 28, 28, 0.12)",
    borderRadius: "8px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.24)",
    color: "#1C1C1C",
    fontFamily: "Outfit Variable, Outfit, system-ui, sans-serif",
    maxWidth: "100%",
    overflow: "hidden",
  })

  Object.assign(pointer.style, {
    background: "#ffffff",
    borderBottom: "1px solid rgba(28, 28, 28, 0.12)",
    borderRight: "1px solid rgba(28, 28, 28, 0.12)",
    bottom: "-7px",
    height: "14px",
    left: "50%",
    position: "absolute",
    transform: "translateX(-50%) rotate(45deg)",
    width: "14px",
  })

  container.append(card, pointer)

  overlay.onAdd = () => {
    overlay.getPanes()?.floatPane.appendChild(container)
  }

  overlay.draw = () => {
    const projection = overlay.getProjection()
    if (!projection) return

    const point = projection.fromLatLngToDivPixel(position)
    if (!point) return

    container.style.display = isVisible ? "block" : "none"
    container.style.left = `${point.x}px`
    container.style.top = `${point.y}px`
  }

  overlay.onRemove = () => {
    container.remove()
  }

  overlay.show = (nextPosition, content) => {
    position = new maps.LatLng(nextPosition[0], nextPosition[1])
    card.innerHTML = content
    isVisible = true
    overlay.draw()
  }

  overlay.hide = () => {
    isVisible = false
    container.style.display = "none"
  }

  overlay.setMap(map)

  return overlay
}

export function Map({
  center = UGANDA_CENTER,
  zoom = 13,
  markers = [],
  route = [],
  polygons = [],
  circles = [],
  height = "400px",
  className = "",
  defaultView = "satellite",
  fitToBounds = false,
  activeMarkerZoom = 15,
  routeColor = "#4A90E2",
  polygonStrokeColor = "#5B8C5A",
  polygonFillColor = "#5B8C5A",
  onMapClick,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<GoogleMapInstance | null>(null)
  const popupOverlayRef = useRef<MapPopupOverlay | null>(null)
  const markerOverlaysRef = useRef<GoogleMapsOverlay[]>([])
  const shapeOverlaysRef = useRef<GoogleMapsOverlay[]>([])
  const clickListenerRef = useRef<GoogleMapsListener | null>(null)
  const [mapsApi, setMapsApi] = useState<GoogleMapsNamespace | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingMaps, setIsLoadingMaps] = useState(true)

  useEffect(() => {
    let isMounted = true
    let retryTimer: number | null = null
    let retryCount = 0

    const loadMaps = () => {
      setIsLoadingMaps(true)

      getGoogleMapsApi()
        .then((maps) => {
          if (!isMounted) return
          setMapsApi(maps)
          setLoadError(null)
          setIsLoadingMaps(false)
        })
        .catch((error: Error) => {
          if (!isMounted) return

          const message = error.message || "Google Maps failed to load."

          if (message === MAP_LOAD_ERROR) {
            setLoadError(message)
            setIsLoadingMaps(false)
            return
          }

          retryCount += 1
          setLoadError(retryCount >= 5 ? message : null)
          setIsLoadingMaps(retryCount < 5)
          retryTimer = window.setTimeout(loadMaps, Math.min(750 * retryCount, 3000))
        })
    }

    loadMaps()

    return () => {
      isMounted = false
      if (retryTimer) window.clearTimeout(retryTimer)
    }
  }, [])

  useEffect(() => {
    if (!mapsApi || !containerRef.current || mapRef.current) return

    try {
      const map = new mapsApi.Map(containerRef.current, {
        center: toLatLngLiteral(center),
        zoom,
        mapTypeId: getMapTypeId(defaultView),
        clickableIcons: false,
        fullscreenControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        gestureHandling: "greedy",
      })

      mapRef.current = map
      popupOverlayRef.current = createPopupOverlay(mapsApi, map)
      setLoadError(null)
      setIsLoadingMaps(false)
    } catch (error) {
      mapRef.current = null
      setLoadError(getErrorMessage(error, "Google Maps failed to initialize."))
      setIsLoadingMaps(false)
    }
  }, [center, defaultView, mapsApi, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map) return

    map.setMapTypeId(getMapTypeId(defaultView))
    map.setCenter(toLatLngLiteral(center))
    map.setZoom(zoom)
  }, [center, defaultView, mapsApi, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map) return

    clickListenerRef.current?.remove()
    clickListenerRef.current = null

    if (onMapClick) {
      clickListenerRef.current = map.addListener("click", (event: any) => {
        if (!event.latLng) return
        onMapClick([event.latLng.lat(), event.latLng.lng()])
      })
    }

    return () => {
      clickListenerRef.current?.remove()
      clickListenerRef.current = null
    }
  }, [mapsApi, onMapClick])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map) return

    markerOverlaysRef.current.forEach((overlay) => overlay.setMap(null))
    markerOverlaysRef.current = []

    const popupOverlay = popupOverlayRef.current
    let activeMarker: any | null = null
    let activeMarkerPosition: LatLngTuple | null = null
    let activeMarkerContent = ""

    markers.forEach((marker) => {
      const googleMarker = new mapsApi.Marker({
        position: toLatLngLiteral(marker.position),
        map,
        title: marker.label,
        icon: createMarkerIcon(mapsApi, marker),
        label: marker.glyph
          ? {
              text: marker.glyph,
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "700",
            }
          : undefined,
        draggable: Boolean(marker.draggable),
        zIndex: marker.active ? 20 : undefined,
      })
      const content = createPopupContent(marker)

      googleMarker.addListener("mouseover", () => {
        marker.onMouseEnter?.()
        popupOverlay?.show(marker.position, content)
      })
      googleMarker.addListener("mouseout", () => {
        marker.onMouseLeave?.()
        if (!marker.active) popupOverlay?.hide()
      })
      googleMarker.addListener("click", () => {
        marker.onClick?.()
        popupOverlay?.show(marker.position, content)
      })
      googleMarker.addListener("dragend", (event: any) => {
        if (!event.latLng) return
        marker.onDragEnd?.([event.latLng.lat(), event.latLng.lng()])
      })

      if (marker.active) {
        activeMarker = googleMarker
        activeMarkerPosition = marker.position
        activeMarkerContent = content
      }

      markerOverlaysRef.current.push(googleMarker)
    })

    if (activeMarker && activeMarkerPosition) {
      popupOverlay?.show(activeMarkerPosition, activeMarkerContent)
      map.panTo(toLatLngLiteral(activeMarkerPosition))
      if (map.getZoom() < activeMarkerZoom) map.setZoom(activeMarkerZoom)
    } else {
      popupOverlay?.hide()
    }
  }, [activeMarkerZoom, mapsApi, markers])

  useEffect(() => {
    const map = mapRef.current
    if (!mapsApi || !map) return

    shapeOverlaysRef.current.forEach((overlay) => overlay.setMap(null))
    shapeOverlaysRef.current = []

    if (route.length >= 2) {
      const polyline = new mapsApi.Polyline({
        path: route.map(toLatLngLiteral),
        geodesic: true,
        strokeColor: routeColor,
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      })
      shapeOverlaysRef.current.push(polyline)
    }

    polygons.forEach((polygonPoints) => {
      if (polygonPoints.length < 3) return
      const polygon = new mapsApi.Polygon({
        paths: polygonPoints.map(toLatLngLiteral),
        strokeColor: polygonStrokeColor,
        strokeOpacity: 0.95,
        strokeWeight: 3,
        fillColor: polygonFillColor,
        fillOpacity: 0.24,
        map,
      })
      shapeOverlaysRef.current.push(polygon)
    })

    circles.forEach((circle) => {
      const circleOverlay = new mapsApi.Circle({
        center: toLatLngLiteral(circle.center),
        radius: circle.radius,
        strokeColor: circle.color ?? "#E5533D",
        strokeOpacity: circle.strokeOpacity ?? 0,
        strokeWeight: 1,
        fillColor: circle.color ?? "#E5533D",
        fillOpacity: circle.fillOpacity ?? 0.2,
        map,
      })
      shapeOverlaysRef.current.push(circleOverlay)
    })

    if (fitToBounds) {
      const bounds = new mapsApi.LatLngBounds()
      const points = [
        ...markers.map((marker) => marker.position),
        ...route,
        ...polygons.flat(),
        ...circles.map((circle) => circle.center),
      ]

      points.forEach((point) => extendBounds(mapsApi, bounds, point))
      if (points.length === 1) {
        map.setCenter(toLatLngLiteral(points[0]))
        map.setZoom(Math.max(map.getZoom(), zoom))
      } else if (points.length > 1) {
        map.fitBounds(bounds, 32)
      }
    }
  }, [circles, fitToBounds, mapsApi, markers, polygonFillColor, polygonStrokeColor, polygons, route, routeColor, zoom])

  useEffect(() => {
    return () => {
      clickListenerRef.current?.remove()
      markerOverlaysRef.current.forEach((overlay) => overlay.setMap(null))
      shapeOverlaysRef.current.forEach((overlay) => overlay.setMap(null))
      popupOverlayRef.current?.setMap(null)
    }
  }, [])

  if (isLoadingMaps && !mapsApi) {
    return (
      <div
        className={`flex items-center justify-center border bg-muted/40 text-center ${className}`}
        style={{ height, width: "100%", borderRadius: "8px", overflow: "hidden" }}
      >
        <div className="max-w-sm p-6">
          <p className="text-base font-semibold text-foreground">Loading Google Maps</p>
          <p className="mt-2 text-sm text-muted-foreground">Preparing the map editor...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    const loadErrorTitle = loadError === MAP_LOAD_ERROR ? "Google Maps key required" : "Google Maps unavailable"

    return (
      <div
        className={`flex items-center justify-center border bg-muted/40 text-center ${className}`}
        style={{ height, width: "100%", borderRadius: "8px", overflow: "hidden" }}
      >
        <div className="max-w-sm p-6">
          <p className="text-base font-semibold text-foreground">{loadErrorTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{ height, width: "100%", borderRadius: "8px", overflow: "hidden" }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

export function EditableGoogleMap({
  points,
  onPointsChange,
  shape,
  lineMode = "straight",
  center = UGANDA_CENTER,
  zoom = 11,
  height = "420px",
  className = "",
  markerColor = "#DAA22A",
  strokeColor = "#DAA22A",
  fillColor = "#5B8C5A",
  fitToBounds = false,
}: EditableGoogleMapProps) {
  const routePoints = shape === "line" && lineMode === "smooth"
    ? createSmoothLinePath(points)
    : points
  const markers: MapMarker[] = points.map((point, index) => ({
    position: point,
    label: `Point ${index + 1}`,
    color: markerColor,
    glyph: String(index + 1),
    draggable: true,
    onDragEnd: (nextPoint) => {
      onPointsChange(points.map((currentPoint, currentIndex) => (
        currentIndex === index ? nextPoint : currentPoint
      )))
    },
  }))

  return (
    <Map
      center={center}
      zoom={zoom}
      markers={markers}
      route={routePoints.length >= 2 ? routePoints : []}
      polygons={shape === "polygon" && points.length >= 3 ? [points] : []}
      circles={[]}
      height={height}
      className={className}
      defaultView="satellite"
      fitToBounds={fitToBounds && points.length > 0}
      routeColor={strokeColor}
      polygonStrokeColor={fillColor}
      polygonFillColor={fillColor}
      onMapClick={(position) => onPointsChange([...points, position])}
    />
  )
}
