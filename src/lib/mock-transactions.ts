export type MockTransaction = {
  id: string
  vehicle: string
  vehicleType: string
  amount: number
  status: "Completed" | "Pending" | "Failed"
  date: string
  location: string
  operator: string
}

export const mockTransactions: MockTransaction[] = [
  {
    id: "TXN-001",
    vehicle: "AAB-123-MP",
    vehicleType: "Cargo Truck",
    amount: 2500,
    status: "Completed",
    date: "2026-05-04 09:23",
    location: "Maputo Central",
    operator: "Joana Macavel",
  },
  {
    id: "TXN-002",
    vehicle: "XYZ-456-MP",
    vehicleType: "Tractor",
    amount: 1800,
    status: "Completed",
    date: "2026-05-04 09:15",
    location: "Matola Gate",
    operator: "Joao Silva",
  },
  {
    id: "TXN-003",
    vehicle: "LMN-789-MP",
    vehicleType: "Heavy Truck",
    amount: 3200,
    status: "Pending",
    date: "2026-05-04 09:10",
    location: "Maputo Port",
    operator: "Maria Santos",
  },
  {
    id: "TXN-004",
    vehicle: "QRS-321-MP",
    vehicleType: "Cargo Truck",
    amount: 2500,
    status: "Failed",
    date: "2026-05-04 08:55",
    location: "Maputo Central",
    operator: "Pedro Costa",
  },
  {
    id: "TXN-005",
    vehicle: "TUV-654-MP",
    vehicleType: "Tractor",
    amount: 1800,
    status: "Completed",
    date: "2026-05-04 08:42",
    location: "Matola Gate",
    operator: "Ana Ferreira",
  },
  {
    id: "TXN-006",
    vehicle: "WXY-987-MP",
    vehicleType: "Heavy Truck",
    amount: 3200,
    status: "Completed",
    date: "2026-05-04 08:30",
    location: "Maputo Port",
    operator: "Joana Macavel",
  },
]
