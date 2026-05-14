import type { AssignDeviceRequest } from "./schemas"

export const buildDeviceAssignmentPayload = (input: {
  vehicleId: string
  plateNumber: string
  assignedBy: string
  mode: "assign" | "replace"
}): AssignDeviceRequest => ({
  vehicleId: input.vehicleId,
  vehiclePlateSnapshot: input.plateNumber,
  vehicleTruckNumberSnapshot: `TRK-${input.plateNumber}`,
  assignedBy: input.assignedBy,
  reason:
    input.mode === "replace"
      ? "UAT tracker replacement from admin console"
      : "UAT tracker assignment from admin console",
})
