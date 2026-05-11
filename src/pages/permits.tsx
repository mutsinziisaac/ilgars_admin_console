import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoadClosurePermitsContent } from "@/pages/road-closure-permits"
import { AuthorizationsPage } from "@/pages/authorizations"

export function PermitsPage() {
  const [activeTab, setActiveTab] = useState("road-closure-permits")
  
  // Count badges from mock data
  const roadClosurePermitsBadge = 8 // From mockPermits pending count
  const heavyTruckPermitsBadge = 5 // From mockAuthorizations pending count

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Permits & Authorizations</h1>
        <p className="text-lg text-muted-foreground">Manage road closure permits and heavy truck authorizations</p>
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
          <TabsTrigger value="heavy-truck-permits" className="text-base relative">
            Heavy Truck Permits
            {heavyTruckPermitsBadge > 0 && (
              <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#DAA22A] text-sm text-[#1C1C1C] font-semibold">
                {heavyTruckPermitsBadge}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="road-closure-permits" className="mt-6">
          <RoadClosurePermitsContent />
        </TabsContent>

        <TabsContent value="heavy-truck-permits" className="mt-6">
          <AuthorizationsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
