import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, RefreshCw, Bell, Mail, Database, Shield, Globe } from "lucide-react"
import { toast } from "sonner"

export function ConfigsPage() {
  const [isLoading, setIsLoading] = useState(false)

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    systemName: "Maputo RUC",
    currency: "MZN",
    language: "en",
    dateFormat: "YYYY-MM-DD"
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    overduePaymentAlerts: true,
    enforcementAlerts: true,
    permitApprovalAlerts: true
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    gracePeriodDays: "7",
    lateFeePercentage: "5",
    autoCalculatePenalties: true,
    paymentMethods: "M-Pesa, Bank Transfer"
  })

  const handleSaveSettings = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Settings saved", {
        description: "All configuration changes have been saved successfully."
      })
    }, 1500)
  }

  const handleResetSettings = () => {
    toast.info("Settings reset", {
      description: "All settings have been reset to default values."
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">System Configurations</h1>
          <p className="text-lg text-muted-foreground">Manage system settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleResetSettings} className="text-base h-11 px-6">
            <RefreshCw className="h-5 w-5 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading} className="text-base h-11 px-6">
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">System Settings</CardTitle>
              <CardDescription className="text-base">General system configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="system-name" className="text-base">System Name</Label>
              <Input
                id="system-name"
                value={systemSettings.systemName}
                onChange={(e) => setSystemSettings({ ...systemSettings, systemName: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-base">Currency</Label>
              <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="MZN" className="text-base">MZN - Mozambican Metical</SelectItem>
                  <SelectItem value="USD" className="text-base">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR" className="text-base">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-base">Language</Label>
              <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="en" className="text-base">English</SelectItem>
                  <SelectItem value="pt" className="text-base">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4FAF7C]/10">
              <Bell className="h-5 w-5 text-[#4FAF7C]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Notification Settings</CardTitle>
              <CardDescription className="text-base">Configure alert and notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-base font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Badge className={notificationSettings.emailNotifications ? "bg-[#4FAF7C]" : "bg-muted"}>
              {notificationSettings.emailNotifications ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-base font-medium">Overdue Payment Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when payments are overdue</p>
              </div>
            </div>
            <Badge className={notificationSettings.overduePaymentAlerts ? "bg-[#4FAF7C]" : "bg-muted"}>
              {notificationSettings.overduePaymentAlerts ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-base font-medium">Enforcement Alerts</p>
                <p className="text-sm text-muted-foreground">Notifications for enforcement actions</p>
              </div>
            </div>
            <Badge className={notificationSettings.enforcementAlerts ? "bg-[#4FAF7C]" : "bg-muted"}>
              {notificationSettings.enforcementAlerts ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-base font-medium">Permit Approval Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about pending permit approvals</p>
              </div>
            </div>
            <Badge className={notificationSettings.permitApprovalAlerts ? "bg-[#4FAF7C]" : "bg-muted"}>
              {notificationSettings.permitApprovalAlerts ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Penalty Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DAA22A]/10">
              <Database className="h-5 w-5 text-[#DAA22A]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Payment & Penalty Settings</CardTitle>
              <CardDescription className="text-base">Configure payment rules and penalties</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grace-period" className="text-base">Grace Period (Days)</Label>
              <Input
                id="grace-period"
                type="number"
                value={paymentSettings.gracePeriodDays}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, gracePeriodDays: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Days before late fees apply</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="late-fee" className="text-base">Late Fee Percentage (%)</Label>
              <Input
                id="late-fee"
                type="number"
                value={paymentSettings.lateFeePercentage}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, lateFeePercentage: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Percentage added for late payments</p>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="payment-methods" className="text-base">Accepted Payment Methods</Label>
              <Input
                id="payment-methods"
                value={paymentSettings.paymentMethods}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentMethods: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Comma-separated list of payment methods</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="text-base font-medium">Auto-Calculate Penalties</p>
              <p className="text-sm text-muted-foreground">Automatically calculate and apply late payment penalties</p>
            </div>
            <Badge className={paymentSettings.autoCalculatePenalties ? "bg-[#4FAF7C]" : "bg-muted"}>
              {paymentSettings.autoCalculatePenalties ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Integration Settings</CardTitle>
              <CardDescription className="text-base">External service integrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="text-base font-medium">M-Pesa Integration</p>
              <p className="text-sm text-muted-foreground">Mobile payment gateway</p>
            </div>
            <Badge className="bg-[#4FAF7C]">Connected</Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="text-base font-medium">SMS Gateway</p>
              <p className="text-sm text-muted-foreground">SMS notification service</p>
            </div>
            <Badge className="bg-muted">Not Connected</Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="text-base font-medium">Email Service</p>
              <p className="text-sm text-muted-foreground">Email notification service</p>
            </div>
            <Badge className="bg-[#4FAF7C]">Connected</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
