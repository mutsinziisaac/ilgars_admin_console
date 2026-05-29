import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoadClosurePermitsContent } from "@/pages/road-closure-permits"
import { SpecialPermitsPage } from "@/pages/special-permits"
import {
  readSpecialPermitTotal,
  useSpecialPermitRouteRequestsList,
  useSpecialPermitsList,
} from "@/lib/api/special-permits/hooks"

export function PermitsPage() {
  const [activeTab, setActiveTab] = useState("road-closure-permits")

  // Count badges are kept lightweight here; each tab fetches its own live data.
  const roadClosurePermitsBadge = 8 // From mockPermits pending count
  const specialPermitListParams = { page: 0, size: 100 }
  const specialPermitsQuery = useSpecialPermitsList(specialPermitListParams)
  const routeRequestsQuery = useSpecialPermitRouteRequestsList(specialPermitListParams)
  const specialPermitsBadge =
    readSpecialPermitTotal(specialPermitsQuery.data) +
    readSpecialPermitTotal(routeRequestsQuery.data)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Permits & Authorizations</h1>
        <p className="text-lg text-muted-foreground">Manage road closure permits and special permit authorizations</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-2 h-14">
          <TabsTrigger value="road-closure-permits" className="text-base relative">
            Road Closure Permits
            {roadClosurePermitsBadge > 0 && (
              <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#DAA22A] text-sm text-[#1C1C1C] font-semibold">
                {roadClosurePermitsBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="special-permits" className="text-base relative">
            Special Permits
            {specialPermitsBadge > 0 && (
              <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#DAA22A] text-sm text-[#1C1C1C] font-semibold">
                {specialPermitsBadge}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="road-closure-permits" className="mt-6">
          <RoadClosurePermitsContent />
        </TabsContent>

        <TabsContent value="special-permits" className="mt-6">
          <SpecialPermitsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
