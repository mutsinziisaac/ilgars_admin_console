type LatLngTuple = [number, number]

export const KAMPALA_CENTER: LatLngTuple = [0.3476, 32.5825]
export const UGANDA_CENTER: LatLngTuple = KAMPALA_CENTER
export const UGANDA_OVERVIEW_ZOOM = 7

export const isUgandaCoordinate = ([latitude, longitude]: LatLngTuple) =>
  latitude >= -1.6 &&
  latitude <= 4.4 &&
  longitude >= 29.4 &&
  longitude <= 35.1
