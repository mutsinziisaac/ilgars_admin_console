import { userManager } from "@/lib/userManager"

export const getCurrentUsername = async () => {
  const user = await userManager.getUser()
  const profile = user?.profile

  return (
    profile?.preferred_username ||
    profile?.name ||
    profile?.email ||
    "SystemAdmin"
  )
}
