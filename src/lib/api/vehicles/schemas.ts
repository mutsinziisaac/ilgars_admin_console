import { z } from "zod";

// Motorvehicle service schema based on /api/v1/vehicles.
export const VehicleSchema = z
  .object({
    id: z.string().optional(),
    plateNumber: z.string(),
    truckNumber: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
    ownerName: z.string().optional().nullable(),
    operatorName: z.string().optional().nullable(),
    currentLogbookCapacity: z.number().optional().nullable(),
    capacity: z.number().optional().nullable(),
    capacityUnit: z.string().optional().nullable(),
    make: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.number().optional().nullable(),
    color: z.string().optional().nullable(),
    vin: z.string().optional().nullable(),
    vehicleType: z.string().optional().nullable(),
    fuelType: z.string().optional().nullable(),
    serviceType: z.string().optional().nullable(),
    registryStatus: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough();

const PageMetaSchema = z
  .object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
    size: z.number().optional(),
    number: z.number().optional(),
    total: z.number().optional(),
    totalElements: z.number().optional(),
    pageCount: z.number().optional(),
    totalPages: z.number().optional(),
  })
  .optional();

const VehicleListEnvelopeSchema = z
  .object({
    data: z
      .union([
        z.array(VehicleSchema),
        z
          .object({
            content: z.array(VehicleSchema).optional(),
            items: z.array(VehicleSchema).optional(),
            page: z.number().optional(),
            pageSize: z.number().optional(),
            size: z.number().optional(),
            number: z.number().optional(),
            total: z.number().optional(),
            totalElements: z.number().optional(),
            pageCount: z.number().optional(),
            totalPages: z.number().optional(),
          })
          .passthrough(),
      ])
      .optional(),
    content: z.array(VehicleSchema).optional(),
    items: z.array(VehicleSchema).optional(),
    meta: PageMetaSchema,
  })
  .passthrough();

export const VehicleListResponseSchema = z
  .union([z.array(VehicleSchema), VehicleListEnvelopeSchema])
  .transform((response) => {
    if (Array.isArray(response)) {
      return { data: response };
    }

    if (Array.isArray(response.data)) {
      return { data: response.data, meta: response.meta };
    }

    if (Array.isArray(response.data?.content)) {
      return { data: response.data.content, meta: response.meta ?? response.data };
    }

    if (Array.isArray(response.data?.items)) {
      return { data: response.data.items, meta: response.meta ?? response.data };
    }

    if (Array.isArray(response.content)) {
      return { data: response.content, meta: response.meta };
    }

    if (Array.isArray(response.items)) {
      return { data: response.items, meta: response.meta };
    }

    return { data: [], meta: response.meta };
  });

export const VehicleDetailResponseSchema = z
  .union([VehicleSchema, z.object({ data: VehicleSchema })])
  .transform((response) => {
    if ("data" in response) {
      return response;
    }

    return { data: response };
  });

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleListResponse = z.infer<typeof VehicleListResponseSchema>;
export type VehicleDetailResponse = z.infer<typeof VehicleDetailResponseSchema>;

// Legacy exports for backward compatibility while pages are migrated.
export const FleetVehicleSchema = VehicleSchema;
export const FleetVehicleListResponseSchema = VehicleListResponseSchema;
export const FleetVehicleDetailResponseSchema = VehicleDetailResponseSchema;
export type FleetVehicle = Vehicle;
export type FleetVehicleListResponse = VehicleListResponse;
export type FleetVehicleDetailResponse = VehicleDetailResponse;
