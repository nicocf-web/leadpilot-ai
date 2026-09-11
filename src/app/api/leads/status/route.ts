import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { recordLeadActivity } from "@/lib/lead-activity";
import { prisma } from "@/lib/prisma";

const validStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
] as const;

type LeadStatus = (typeof validStatuses)[number];

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status
        : "";

    if (
      !id ||
      !validStatuses.includes(status as LeadStatus)
    ) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 },
      );
    }

    const currentLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!currentLead) {
      return NextResponse.json(
        { error: "Lead no encontrado." },
        { status: 404 },
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status: status as LeadStatus,
      },
    });

    if (currentLead.status !== status) {
      await recordLeadActivity({
        leadId: id,
        type: "STATUS_CHANGED",
        message: `Estado cambiado de ${currentLead.status} a ${status}.`,
        metadata: {
          from: currentLead.status,
          to: status,
        },
      });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Lead status update failed:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el estado." },
      { status: 500 },
    );
  }
}