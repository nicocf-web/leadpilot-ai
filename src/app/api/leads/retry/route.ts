import { createClient } from "@/lib/supabase/server";
import { after, NextResponse } from "next/server";
import { processLeadAnalysis } from "@/lib/process-lead-analysis";
import { prisma } from "@/lib/prisma";
import { recordLeadActivity } from "@/lib/lead-activity";

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

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del lead." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado." },
        { status: 404 },
      );
    }

    await prisma.lead.update({
      where: { id },
      data: {
        analysisStatus: "PENDING",
        analysisError: null,
      },
    });
await recordLeadActivity({
  leadId: id,
  type: "AI_RETRY",
  message: "Se solicitó un reintento del análisis de IA.",
});
    after(async () => {
      await processLeadAnalysis(id);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Retry analysis failed:", error);

    return NextResponse.json(
      { error: "No se pudo reintentar el análisis." },
      { status: 500 },
    );
  }
}