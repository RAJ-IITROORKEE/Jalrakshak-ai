import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "jr_admin_session";

export async function isAdminAuthenticated() {
  const store = await cookies();
  const session = store.get(ADMIN_SESSION_COOKIE)?.value;
  return session === "1";
}
