export const devicesKeys = {
  all: () => ["devices"] as const,
  list: (filters?: unknown) =>
    filters ? (["devices", "list", filters] as const) : (["devices", "list"] as const),
  activeByVehicle: (vehicleId: string) => ["devices", "active-by-vehicle", vehicleId] as const,
}
