import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { recordLeadActivity } from "@/lib/lead-activity";

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

  const notes = await prisma.leadNote.findMany({
    where: {
      leadId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 },
    );
  }

  const body = await request.json();

  const leadId = body.leadId;
  const content = body.content?.trim();

  if (!leadId || !content) {
    return NextResponse.json(
      { error: "Lead y contenido son obligatorios." },
      { status: 400 },
    );
  }

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
    select: {
      id: true,
    },
  });

  if (!lead) {
    return NextResponse.json(
      { error: "Lead no encontrado." },
      { status: 404 },
    );
  }

  const note = await prisma.leadNote.create({
    data: {
      leadId,
      content,
    },
  });
await recordLeadActivity({
  leadId,
  type: "NOTE_ADDED",
  message: "Se agregó una nota interna.",
  metadata: {
    noteId: note.id,
  },
});
  return NextResponse.json(note, { status: 201 });
}