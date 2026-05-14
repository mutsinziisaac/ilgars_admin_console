import type { RegisterDeviceRequest } from "./schemas"

export const buildDefaultRegisterDevicePayload = (input: {
  deviceUid: string
  imei?: string
  simMsisdn?: string
}): RegisterDeviceRequest => {
  const timestamp = Date.now()
  const deviceUid = input.deviceUid.trim()
  const imei = input.imei?.trim() || `356000${timestamp}`
  const simMsisdn = input.simMsisdn?.trim().replace(/\s+/g, "") || `+25884${String(timestamp).slice(-7)}`

  return {
    deviceUid,
    serialNumber: `SER-${deviceUid || timestamp}`,
    imei,
    simIccid: `892580${timestamp}`,
    simMsisdn,
    vendor: "BMC",
    model: "A1000",
    providerKey: "bmc",
    providerDeviceRef: `BMC-${deviceUid || timestamp}`,
    protocol: "TCP",
    firmwareVersion: "uat-1.0",
    status: "REGISTERED",
  }
}
