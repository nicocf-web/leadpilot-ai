import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json(
      { error: "Falta el ID del lead." },
      { status: 400 },
    );
  }

  const activities = await prisma.leadActivity.findMany({
    where: {
      leadId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(activities);
}