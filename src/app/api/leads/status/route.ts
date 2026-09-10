import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { recordLeadActivity } from "@/lib/lead-activity";

const validStatuses = ["NEW", "CONTACTED", "QUALIFIED"] as const;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const id = body.id;
    const status = body.status;

    if (!id || !validStatuses.includes(status)) {
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
      data: { status },
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