type LatLngTuple = [number, number]

export const UGANDA_CENTER: LatLngTuple = [1.3733, 32.2903]
export const UGANDA_OVERVIEW_ZOOM = 7

export const isUgandaCoordinate = ([latitude, longitude]: LatLngTuple) =>
  latitude >= -1.6 &&
  latitude <= 4.4 &&
  longitude >= 29.4 &&
  longitude <= 35.1
