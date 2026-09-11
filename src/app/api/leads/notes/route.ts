import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { recordLeadActivity } from "@/lib/lead-activity";
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
  try {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const leadId =
      typeof body.leadId === "string"
        ? body.leadId.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!leadId || !content || content.length > 2000) {
      return NextResponse.json(
        { error: "Datos inválidos." },
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
  } catch (error) {
    console.error("Lead note creation failed:", error);

    return NextResponse.json(
      { error: "No se pudo agregar la nota." },
      { status: 500 },
    );
  }
}