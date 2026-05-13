export const devicesKeys = {
  all: () => ["devices"] as const,
  activeByVehicle: (vehicleId: string) => ["devices", "active-by-vehicle", vehicleId] as const,
}
