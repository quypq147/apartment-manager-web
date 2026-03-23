import { cookies } from "next/headers";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id");
  const userRole = cookieStore.get("user_role");

  if (!userId || !userRole) {
    return null;
  }

  return {
    id: userId.value,
    role: userRole.value as "LANDLORD" | "TENANT" | "ADMIN",
  };
}
