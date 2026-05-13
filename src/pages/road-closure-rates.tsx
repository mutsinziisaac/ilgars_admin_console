import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Loader2, AlertCircle, Info } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateRoadClosureRate,
  useRoadClosureRatesList,
} from "@/lib/api/road-closure-rates/hooks"
import type { RoadClosureRate } from "@/lib/api/road-closure-rates/schemas"
import {
  ACTIVE_MUNICIPALITY_ID_STORAGE_KEY,
  DEFAULT_MUNICIPALITY_ID,
} from "@/lib/api/constants"

type ClosureType = "FULL_CLOSURE" | "PARTIAL_RESTRICTION"
type RoadType = "PRIMARY_ROAD" | "SECONDARY_ROAD" | "TERTIARY_ROAD"
type Purpose = "CONSTRUCTION" | "FILMING" | "SPORTING_EVENTS" | "FAIRS" | "FOR_PROFIT_EVENTS"

const roadTypes: Array<{ label: string; value: RoadType }> = [
  { label: "Protocol Roads", value: "PRIMARY_ROAD" },
  { label: "Secondary Roads", value: "SECONDARY_ROAD" },
  { label: "Tertiary Roads", value: "TERTIARY_ROAD" },
]

const purposes: Array<{ label: string; value: Purpose }> = [
  { label: "Construction works", value: "CONSTRUCTION" },
  { label: "Filming", value: "FILMING" },
  { label: "Sporting events", value: "SPORTING_EVENTS" },
  { label: "Fairs", value: "FAIRS" },
  { label: "For-profit events", value: "FOR_PROFIT_EVENTS" },
]

const defaultRates: Record<ClosureType, Record<Purpose, Record<RoadType, number>>> = {
  FULL_CLOSURE: {
    CONSTRUCTION: { PRIMARY_ROAD: 50000, SECONDARY_ROAD: 30000, TERTIARY_ROAD: 15000 },
    FILMING: { PRIMARY_ROAD: 50000, SECONDARY_ROAD: 30000, TERTIARY_ROAD: 20000 },
    SPORTING_EVENTS: { PRIMARY_ROAD: 10000, SECONDARY_ROAD: 5000, TERTIARY_ROAD: 3500 },
    FAIRS: { PRIMARY_ROAD: 2000, SECONDARY_ROAD: 1000, TERTIARY_ROAD: 0 },
    FOR_PROFIT_EVENTS: { PRIMARY_ROAD: 40000, SECONDARY_ROAD: 20000, TERTIARY_ROAD: 10000 },
  },
  PARTIAL_RESTRICTION: {
    CONSTRUCTION: { PRIMARY_ROAD: 10000, SECONDARY_ROAD: 5000, TERTIARY_ROAD: 3500 },
    FILMING: { PRIMARY_ROAD: 40000, SECONDARY_ROAD: 30000, TERTIARY_ROAD: 20000 },
    SPORTING_EVENTS: { PRIMARY_ROAD: 5000, SECONDARY_ROAD: 3500, TERTIARY_ROAD: 1800 },
    FAIRS: { PRIMARY_ROAD: 2000, SECONDARY_ROAD: 1000, TERTIARY_ROAD: 0 },
    FOR_PROFIT_EVENTS: { PRIMARY_ROAD: 20000, SECONDARY_ROAD: 10000, TERTIARY_ROAD: 5000 },
  },
}

const getStoredMunicipalityId = () => {
  if (typeof window === "undefined") return DEFAULT_MUNICIPALITY_ID

  return localStorage.getItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY) || DEFAULT_MUNICIPALITY_ID
}

export function RoadClosureRatesPage() {
  const [closureType, setClosureType] = useState<ClosureType>("FULL_CLOSURE")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeMunicipalityId, setActiveMunicipalityId] = useState(getStoredMunicipalityId())
  const [formMunicipalityId, setFormMunicipalityId] = useState(activeMunicipalityId)
  const [draftRates, setDraftRates] = useState(defaultRates.FULL_CLOSURE)

  const { data, isLoading, error, refetch } = useRoadClosureRatesList({
    municipalityId: activeMunicipalityId,
    active: true,
  })
  const createMutation = useCreateRoadClosureRate()
  const rates = data?.data || data?.content || []

  const selectedRates = rates.filter((rate: RoadClosureRate) => {
    if (rate.closureType) return rate.closureType === closureType
    return closureType === "FULL_CLOSURE"
  })

  const getRateForCell = (purpose: Purpose, roadType: RoadType) => {
    const rate = selectedRates.find(
      (item: RoadClosureRate) => item.purpose === purpose && item.roadType === roadType,
    )

    return rate?.hourlyRate
  }

  const updateDraftRate = (purpose: Purpose, roadType: RoadType, value: string) => {
    setDraftRates({
      ...draftRates,
      [purpose]: {
        ...draftRates[purpose],
        [roadType]: Number(value) || 0,
      },
    })
  }

  const openCreateModal = () => {
    setFormMunicipalityId(getStoredMunicipalityId())
    setDraftRates(defaultRates[closureType])
    setIsCreateOpen(true)
  }

  const handleCreateRates = async () => {
    const municipalityId = formMunicipalityId.trim()

    if (!municipalityId) {
      toast.error("Municipality ID is required")
      return
    }

    try {
      await Promise.all(
        purposes.flatMap((purpose) =>
          roadTypes.map((roadType) =>
            createMutation.mutateAsync({
              municipalityId,
              purpose: purpose.value,
              roadType: roadType.value,
              closureType,
              hourlyRate: draftRates[purpose.value][roadType.value],
              currency: "MZN",
              chargeType: "ROAD_CLOSURE",
              active: true,
            }),
          ),
        ),
      )

      localStorage.setItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY, municipalityId)
      setActiveMunicipalityId(municipalityId)
      setIsCreateOpen(false)
      toast.success("Road closure rates created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create rates")
    }
  }

  const title = closureType === "FULL_CLOSURE" ? "Road Closure" : "Partial Road Restriction"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Road Closure Rates</h1>
          <p className="text-lg text-muted-foreground">Configure fee-per-hour rates by purpose and road type</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setClosureType("FULL_CLOSURE")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                closureType === "FULL_CLOSURE"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Closure
            </button>
            <button
              onClick={() => setClosureType("PARTIAL_RESTRICTION")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                closureType === "PARTIAL_RESTRICTION"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Partial Restriction
            </button>
          </div>
          <Button onClick={openCreateModal} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Rates
          </Button>
        </div>
      </div>

      {Boolean(error) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-semibold">Failed to load road closure rates</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title} - fee per hour</CardTitle>
          <CardDescription className="text-base">
            Active backend rates for municipality <span className="font-mono">{activeMunicipalityId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base font-semibold">Purpose</TableHead>
                  {roadTypes.map((roadType) => (
                    <TableHead key={roadType.value} className="text-base font-semibold text-center">
                      {roadType.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {purposes.map((purpose) => (
                  <TableRow key={purpose.value}>
                    <TableCell className="font-medium text-base">{purpose.label}</TableCell>
                    {roadTypes.map((roadType) => {
                      const hourlyRate = getRateForCell(purpose.value, roadType.value)
                      return (
                        <TableCell key={roadType.value} className="text-center">
                          {hourlyRate == null ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            <span className="text-base font-semibold">
                              {hourlyRate.toLocaleString()} MZN
                            </span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && selectedRates.length === 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5" />
              <p>No active rates found for this closure type. Use Create Rates to seed the table from the annexed fees.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-5xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create {title} Rates</ModalTitle>
          <ModalDescription>
            Creates one backend road-closure-rate record for each purpose and road type.
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="municipalityId" className="text-base">Municipality ID *</Label>
              <Input
                id="municipalityId"
                value={formMunicipalityId}
                onChange={(event) => setFormMunicipalityId(event.target.value)}
                placeholder="Backend municipality UUID"
                className="text-base h-11"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base font-semibold">Purpose</TableHead>
                  {roadTypes.map((roadType) => (
                    <TableHead key={roadType.value} className="text-base font-semibold text-center">
                      {roadType.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {purposes.map((purpose) => (
                  <TableRow key={purpose.value}>
                    <TableCell className="font-medium text-base">{purpose.label}</TableCell>
                    {roadTypes.map((roadType) => (
                      <TableCell key={roadType.value} className="text-center">
                        <Input
                          type="number"
                          value={draftRates[purpose.value][roadType.value]}
                          onChange={(event) => updateDraftRate(purpose.value, roadType.value, event.target.value)}
                          className="h-10 text-center"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreateRates} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Rates"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
