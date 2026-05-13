# ILGARS Admin Console - API Endpoints Mapping

## Base URLs
- **Core API**: `https://ilgars.ayinza.dev/core/api/v1`
- **Motor Vehicle API**: `https://ilgars.ayinza.dev/motorvehicle/api/v1`
- **Devices API**: `https://ilgars.ayinza.dev/devices/api/v1`
- **Keycloak**: `https://auth-rtms.ayinza.dev/realms/ilgars`

## Authentication
- **Token Endpoint**: `POST /protocol/openid-connect/token`
- **Grant Type**: `password`
- **Client ID**: `ilgars-ui`

---

## 1. DASHBOARD PAGE
### Endpoints Needed:
- `GET /admin/dashboard/summary` - Dashboard summary stats (currently 501 stub)
- `GET /presence/current?insideBoundary=true` - Current vehicles inside boundary
- `GET /admin/live-map` - Live map data for all vehicles

---

## 2. TRANSACTIONS PAGE
### Endpoints Needed:
- `GET /invoices?vehicleId={id}&status=all` - List all invoices
- `GET /invoices/{invoiceId}` - Get invoice details
- `POST /invoices/{invoiceId}/issue` - Issue invoice
- `POST /invoices/{invoiceId}/payment-status` - Update payment status
- `GET /trip-fees?tripId={id}` - List trip fees
- `GET /trip-fees/{tripFeeId}` - Get trip fee details

---

## 3. VEHICLES PAGE
### Endpoints Needed:
- `GET /vehicles?page=0&size=100` - List vehicles (Motor Vehicle API)
- `GET /vehicles/by-plate/{plateNumber}` - Lookup vehicle by plate (Motor Vehicle API)
- `GET /vehicles?make={make}&model={model}` - Search vehicles (Motor Vehicle API)
- `GET /rating-snapshots/core?vehicleId={id}` - Get vehicle rating snapshot (Motor Vehicle API)

---

## 4. PERMITS - ROAD CLOSURE PERMITS PAGE
### Endpoints Needed:
- `GET /road-closure-permits?municipalityId={id}&status={status}` - List permits
- `GET /road-closure-permits/{permitId}` - Get permit details
- `POST /road-closure-permits` - Create permit request
- `POST /road-closure-permits/{permitId}/approval` - Approve/reject permit
- `POST /road-closure-permits/{permitId}/issue` - Issue permit after payment

---

## 5. PERMITS - HEAVY TRUCK PERMITS (SPECIAL PERMITS)
### Endpoints Needed:
- `GET /special-permits?municipalityId={id}&vehicleId={id}` - List special permits
- `GET /special-permits/{permitId}` - Get permit details
- `POST /special-permits/vehicle-selections` - Create special permit request
- `POST /special-permits/{permitId}/approve` - Approve permit and assign escort
- `POST /special-permits/{permitId}/payment-status` - Update payment status

---

## 6. VIOLATIONS - ALERTS PAGE
### Endpoints Needed:
- `GET /penalties/run-overdue-scan` - Get overdue violations
- `GET /trips?vehicleId={id}` - List trips for violations tracking
- `GET /enforcement/scans?vehicleId={id}&tripId={id}` - List enforcement scans

---

## 7. VIOLATIONS - ENFORCEMENT PAGE
### Endpoints Needed:
- `POST /enforcement/scans/qr` - Scan QR code
- `POST /enforcement/lookups/plate` - Plate number lookup
- `GET /enforcement/vehicles/by-plate/{plateNumber}/compliance` - Check compliance
- `GET /enforcement/scans?vehicleId={id}` - List enforcement scans
- `GET /enforcement/officers/me/kpis` - Officer KPIs

---

## 8. DEVICES - GPS TRACKING PAGE
### Endpoints Needed:
- `GET /devices?status=REGISTERED` - List GPS devices (Devices API)
- `POST /devices` - Register new GPS device (Devices API)
- `GET /devices/{deviceId}` - Get device details (Devices API)
- `POST /devices/{deviceId}/assignments` - Assign device to vehicle (Devices API)
- `GET /vehicles/{vehicleId}/active-device` - Get active device for vehicle (Devices API)
- `GET /admin/live-map` - Live GPS positions

---

## 9. DEVICES - CAMERAS PAGE
### Endpoints Needed:
- `POST /camera/observations` - Camera observations (currently 501 stub)
- Camera device registry endpoints (similar to GPS devices)

---

## 10. REPORTS PAGE
### Endpoints Needed:
- `GET /analytics/trips/heatmap?municipalityId={id}&from={date}&to={date}` - Trip heatmap
- `GET /admin/live-map/postpaid-trucks` - Postpaid trucks map
- `GET /trips?vehicleId={id}` - Trip history for reports

---

## 11. CONFIGURATIONS - MUNICIPALITY PAGE
### Endpoints Needed:
- `POST /municipalities` - Create municipality
- `GET /municipalities/{municipalityId}/configuration` - Get configuration
- `PUT /municipalities/{municipalityId}/configuration` - Update configuration
- `POST /municipalities/{municipalityId}/boundary-versions` - Create boundary version
- `POST /boundary-versions/{boundaryVersionId}/activate` - Activate boundary

---

## 12. CONFIGURATIONS - TARIFF PLANS PAGE
### Endpoints Needed:
- `POST /tariff-plans` - Create tariff plan
- `GET /tariff-plans?municipalityId={id}&status=all` - List tariff plans
- `GET /tariff-plans/{tariffPlanId}` - Get tariff plan
- `PUT /tariff-plans/{tariffPlanId}` - Update tariff plan
- `POST /tariff-plans/{tariffPlanId}/activate` - Activate tariff plan

---

## 13. CONFIGURATIONS - RUC POLICY PAGE
### Endpoints Needed:
- `POST /ruc-policies` - Create RUC policy
- `GET /ruc-policies?municipalityId={id}&active=true` - List RUC policies
- `PUT /ruc-policies/{policyId}` - Update RUC policy
- `POST /ruc-policies/{policyId}/activate` - Activate policy

---

## 14. CONFIGURATIONS - ROUTES PAGE
### Endpoints Needed:
- `POST /municipal-routes` - Create route
- `GET /municipal-routes?municipalityId={id}&allowedUse={use}&active=true` - List routes
- `GET /municipal-routes/{routeId}` - Get route details
- `PUT /municipal-routes/{routeId}` - Update route
- `DELETE /municipal-routes/{routeId}` - Delete route

---

## 15. CONFIGURATIONS - ROAD CLOSURE RATES PAGE
### Endpoints Needed:
- `POST /road-closure-rates` - Create rate configuration
- `GET /road-closure-rates?municipalityId={id}&purpose={purpose}&roadType={type}&active=true` - List rates
- `GET /road-closure-rates/{rateId}` - Get rate details
- `PUT /road-closure-rates/{rateId}` - Update rate
- `POST /road-closure-rates/{rateId}/activate` - Activate rate

---

## 16. CONFIGURATIONS - FINES CONFIGURATION PAGE
### Endpoints Needed:
- `POST /fine-policies` - Create fine policy
- `GET /fine-policies?municipalityId={id}&active=true` - List fine policies
- `GET /fine-policies/{policyId}` - Get fine policy
- `PUT /fine-policies/{policyId}` - Update fine policy
- `DELETE /fine-policies/{policyId}` - Delete fine policy

---

## 17. CONFIGURATIONS - GEOFENCING ZONES (EXEMPT AREAS) PAGE
### Endpoints Needed:
- `POST /exempt-areas` - Create exempt area
- `GET /exempt-areas?municipalityId={id}&active=true` - List exempt areas
- `GET /exempt-areas/{areaId}` - Get exempt area
- `PUT /exempt-areas/{areaId}` - Update exempt area
- `DELETE /exempt-areas/{areaId}` - Delete exempt area

---

## 18. CONFIGURATIONS - VEHICLE CLASSIFICATION PAGE
### Endpoints Needed:
- Vehicle classification endpoints (may need to be added to Motor Vehicle API)
- Currently using mock data - API endpoints TBD

---

## 19. CONFIGURATIONS - WEIGHT CATEGORIES PAGE
### Endpoints Needed:
- Weight category endpoints (may need to be added to Motor Vehicle API)
- Currently using mock data - API endpoints TBD

---

## 20. CONFIGURATIONS - TIME WINDOWS PAGE
### Endpoints Needed:
- Time window endpoints (may need to be added to Core API)
- Currently using mock data - API endpoints TBD

---

## TRIPS (Supporting Data)
### Endpoints Needed:
- `POST /trips` - Create trip
- `GET /trips?vehicleId={id}` - List trips
- `GET /trips/{tripId}` - Get trip details
- `POST /trips/{tripId}/close` - Close trip manually
- `GET /trips/{tripId}/route-points?serviceDate={date}` - Get route points

---

## SPECIAL PERMIT ROUTE REQUESTS
### Endpoints Needed:
- `POST /special-permit-route-requests` - Create route request for security review
- `GET /special-permit-route-requests?municipalityId={id}&status=PENDING_SECURITY_REVIEW` - List pending requests

---

## Key Variables from Postman:
- `municipalityId`: `aa73ac5e-4912-460f-a927-ba3ccbe57207`
- `boundaryVersionId`: `5186c432-23e3-420e-be95-20bbf3dec0a7`
- `tariffPlanId`: `9ee96bb0-5585-46d0-a4dd-ab920d69e8ff`

---

## Implementation Priority:

### HIGH PRIORITY (Core Admin Functions):
1. **Tariff Plans** - Complete CRUD with activation
2. **RUC Policy** - Complete CRUD with activation
3. **Road Closure Rates** - Complete CRUD with activation
4. **Vehicles** - List and search functionality
5. **Road Closure Permits** - List, approve/reject, issue

### MEDIUM PRIORITY (Operational):
6. **Transactions** - Invoice management
7. **GPS Tracking** - Device registry and assignments
8. **Routes** - Municipal route management
9. **Fines Configuration** - Fine policy management
10. **Exempt Areas** - Geofencing zone management

### LOW PRIORITY (Analytics & Monitoring):
11. **Dashboard** - Summary stats and live map
12. **Enforcement** - QR scanning and plate lookup
13. **Alerts** - Violation tracking
14. **Reports** - Analytics and heatmaps

### TBD (Endpoints Not Yet Available):
15. **Vehicle Classification** - Needs API endpoints
16. **Weight Categories** - Needs API endpoints
17. **Time Windows** - Needs API endpoints
18. **Cameras** - Currently 501 stub

---

## Notes:
- All endpoints require Bearer token authentication
- Use `municipalityId: aa73ac5e-4912-460f-a927-ba3ccbe57207` for all requests
- Responses follow pattern: `{ data: {...} }` or direct object
- Error responses include `error.code` field
- Some endpoints are currently 501 stubs (Camera observations, Dashboard summary)
