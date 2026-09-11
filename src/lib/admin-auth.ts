import { createClient } from "@/lib/supabase/server";

export async function isAdminAuthenticated() {
  const adminUserId = process.env.ADMIN_USER_ID;

  if (!adminUserId) {
    console.error("ADMIN_USER_ID no está configurado.");
    return false;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const userId =
    typeof data?.claims?.sub === "string"
      ? data.claims.sub
      : null;

  return userId === adminUserId;
}