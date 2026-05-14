import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Loader2, AlertCircle, Info, Edit } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateRoadClosureRate,
  useRoadClosureRatesList,
} from "@/lib/api/road-closure-rates/hooks"
import { RoadClosureRatesApi } from "@/lib/api/road-closure-rates/api"
import type { RoadClosureRate } from "@/lib/api/road-closure-rates/schemas"
import { ROAD_CLOSURE_RATES_STORAGE_KEY_PREFIX } from "@/lib/api/constants"
import {
  getMunicipalityDisplayName,
  getStoredMunicipalityId as getRegistryMunicipalityId,
} from "@/lib/municipality-registry"

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

const EMPTY_RATES: RoadClosureRate[] = []

const getStoredMunicipalityId = () => {
  return getRegistryMunicipalityId()
}

const getRatesStorageKey = (municipalityId: string) =>
  `${ROAD_CLOSURE_RATES_STORAGE_KEY_PREFIX}.${municipalityId}`

const getStoredRates = (municipalityId: string): RoadClosureRate[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getRatesStorageKey(municipalityId))
    return stored ? (JSON.parse(stored) as RoadClosureRate[]) : []
  } catch {
    return []
  }
}

const storeRates = (municipalityId: string, rates: RoadClosureRate[]) => {
  if (typeof window === "undefined") return

  localStorage.setItem(getRatesStorageKey(municipalityId), JSON.stringify(rates))
}

const getRateKey = (rate: RoadClosureRate) =>
  `${rate.municipalityId}.${rate.closureType ?? "FULL_CLOSURE"}.${rate.purpose}.${rate.roadType}`

const mergeRates = (incoming: RoadClosureRate[], fallback: RoadClosureRate[] = []) => {
  const byKey = new Map<string, RoadClosureRate>()

  fallback.forEach((rate) => byKey.set(getRateKey(rate), rate))
  incoming.forEach((rate) => byKey.set(getRateKey(rate), rate))

  return Array.from(byKey.values())
}

const buildDraftRatesFromExisting = (
  closureType: ClosureType,
  existingRates: RoadClosureRate[],
) => {
  const nextDraftRates = structuredClone(defaultRates[closureType])

  existingRates.forEach((rate) => {
    const purpose = rate.purpose as Purpose
    const roadType = rate.roadType as RoadType

    if (nextDraftRates[purpose]?.[roadType] != null) {
      nextDraftRates[purpose][roadType] = rate.hourlyRate
    }
  })

  return nextDraftRates
}

export function RoadClosureRatesPage() {
  const [closureType, setClosureType] = useState<ClosureType>("FULL_CLOSURE")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeMunicipalityId, setActiveMunicipalityId] = useState(getStoredMunicipalityId())
  const [formMunicipalityId, setFormMunicipalityId] = useState(activeMunicipalityId)
  const [draftRates, setDraftRates] = useState(defaultRates.FULL_CLOSURE)
  const [isSavingRates, setIsSavingRates] = useState(false)
  const [cachedRates, setCachedRates] = useState<RoadClosureRate[]>(() =>
    getStoredRates(getStoredMunicipalityId()),
  )

  const { data, isLoading, error, refetch } = useRoadClosureRatesList({
    municipalityId: activeMunicipalityId,
  })
  const createMutation = useCreateRoadClosureRate()
  const apiRates = data?.data ?? data?.content ?? EMPTY_RATES
  const rates = useMemo(() => mergeRates(apiRates, cachedRates), [apiRates, cachedRates])

  useEffect(() => {
    const latestMunicipalityId = getStoredMunicipalityId()
    setActiveMunicipalityId(latestMunicipalityId)
    setFormMunicipalityId(latestMunicipalityId)
    setCachedRates(getStoredRates(latestMunicipalityId))
  }, [])

  useEffect(() => {
    if (!apiRates.length) return

    const nextRates = mergeRates(apiRates, getStoredRates(activeMunicipalityId))
    setCachedRates(nextRates)
    storeRates(activeMunicipalityId, nextRates)
  }, [activeMunicipalityId, apiRates])

  const selectedRates = rates.filter((rate: RoadClosureRate) => {
    if (rate.closureType) return rate.closureType === closureType
    return closureType === "FULL_CLOSURE"
  })
  const hasRatesForClosureType = selectedRates.length > 0
  const isSubmittingRates = isSavingRates || createMutation.isPending

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
    const municipalityId = getStoredMunicipalityId()
    setFormMunicipalityId(municipalityId)
    setActiveMunicipalityId(municipalityId)
    setCachedRates(getStoredRates(municipalityId))
    setDraftRates(
      hasRatesForClosureType
        ? buildDraftRatesFromExisting(closureType, selectedRates)
        : structuredClone(defaultRates[closureType]),
    )
    setIsCreateOpen(true)
  }

  const handleCreateRates = async () => {
    const municipalityId = formMunicipalityId.trim()

    if (!municipalityId) {
      toast.error("Create a municipality before creating road closure rates")
      return
    }

    try {
      setIsSavingRates(true)
      const responses = await Promise.all(
        purposes.flatMap((purpose) =>
          roadTypes.map((roadType) => {
            const existingRate = selectedRates.find(
              (rate) => rate.purpose === purpose.value && rate.roadType === roadType.value,
            )
            const payload = {
              municipalityId,
              purpose: purpose.value,
              roadType: roadType.value,
              closureType,
              hourlyRate: draftRates[purpose.value][roadType.value],
              currency: "MZN",
              chargeType: "ROAD_CLOSURE",
              active: true,
            }

            return existingRate
              ? RoadClosureRatesApi.updateRoadClosureRate(existingRate.id, payload)
              : createMutation.mutateAsync(payload)
          }),
        ),
      )
      const createdRates = responses.map((response) => ({
        ...response.data,
        municipalityId: response.data.municipalityId || municipalityId,
        closureType,
        active: response.data.active ?? true,
      }))
      const nextRates = mergeRates(createdRates, getStoredRates(municipalityId))

      setActiveMunicipalityId(municipalityId)
      setCachedRates(nextRates)
      storeRates(municipalityId, nextRates)
      setIsCreateOpen(false)
      toast.success(hasRatesForClosureType ? "Road closure rates updated" : "Road closure rates created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create rates")
    } finally {
      setIsSavingRates(false)
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
          <Button onClick={openCreateModal} disabled={isSubmittingRates}>
            {isSubmittingRates ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : hasRatesForClosureType ? (
              <Edit className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {hasRatesForClosureType ? "Edit Rates" : "Create Rates"}
          </Button>
        </div>
      </div>

      {Boolean(error) && rates.length === 0 && (
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
          <CardDescription className="text-base">Backend rates by purpose and road type</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && rates.length === 0 ? (
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

          {!(isLoading && rates.length === 0) && selectedRates.length === 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5" />
              <p>No active rates found for this closure type. Use Create Rates to seed the table from the annexed fees.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-5xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>{hasRatesForClosureType ? "Edit" : "Create"} {title} Rates</ModalTitle>
          <ModalDescription>
            {hasRatesForClosureType
              ? "Updates the backend road-closure-rate records for this closure type."
              : "Creates one backend road-closure-rate record for each purpose and road type."}
          </ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(formMunicipalityId)}
              </div>
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
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmittingRates}>
            Cancel
          </Button>
          <Button onClick={handleCreateRates} disabled={isSubmittingRates}>
            {isSubmittingRates ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {hasRatesForClosureType ? "Saving..." : "Creating..."}
              </>
            ) : (
              hasRatesForClosureType ? "Save Rates" : "Create Rates"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
