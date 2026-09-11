import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
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