import { z } from "zod";

// Fleet Vehicle schema based on Core API /v1/fleet-vehicles endpoint
export const FleetVehicleSchema = z.object({
  id: z.string().optional(),
  plateNumber: z.string(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  vehicleType: z.string().optional(),
  weight: z.number().optional(),
  capacity: z.number().optional(),
  ownerName: z.string().optional(),
  ownerContact: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerAddress: z.string().optional(),
  registrationDate: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const FleetVehicleListResponseSchema = z.object({
  data: z.array(FleetVehicleSchema),
  meta: z
    .object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      total: z.number().optional(),
      pageCount: z.number().optional(),
    })
    .optional(),
});

export const FleetVehicleDetailResponseSchema = z.object({
  data: FleetVehicleSchema,
});

export type FleetVehicle = z.infer<typeof FleetVehicleSchema>;
export type FleetVehicleListResponse = z.infer<typeof FleetVehicleListResponseSchema>;
export type FleetVehicleDetailResponse = z.infer<typeof FleetVehicleDetailResponseSchema>;

// Legacy exports for backward compatibility
export type Vehicle = FleetVehicle;
export type VehicleListResponse = FleetVehicleListResponse;
export type VehicleDetailResponse = FleetVehicleDetailResponse;
