import { after, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { processLeadAnalysis } from "@/lib/process-lead-analysis";
import { prisma } from "@/lib/prisma";
import { recordLeadActivity } from "@/lib/lead-activity";
import { leadRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function GET() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 },
    );
  }

  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    const company =
      typeof body.company === "string" ? body.company.trim() : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (
      !name ||
      !email ||
      !message ||
      name.length < 2 ||
      name.length > 80 ||
      email.length > 254 ||
      company.length > 120 ||
      message.length < 10 ||
      message.length > 2000
    ) {
      return NextResponse.json(
        { error: "Los datos enviados no son válidos." },
        { status: 400 },
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "El email no es válido." },
        { status: 400 },
      );
    }

    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      const forwardedFor = request.headers.get("x-forwarded-for");

      const ip =
        forwardedFor?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const { success } = await leadRateLimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error:
              "Demasiados intentos. Esperá unos minutos e intentá nuevamente.",
          },
          { status: 429 },
        );
      }

      const turnstileToken =
        typeof body.turnstileToken === "string"
          ? body.turnstileToken
          : "";

      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Falta la verificación de seguridad." },
          { status: 403 },
        );
      }

      const turnstileValid = await verifyTurnstile(
        turnstileToken,
        ip === "unknown" ? undefined : ip,
      );

      if (!turnstileValid) {
        return NextResponse.json(
          {
            error:
              "La verificación de seguridad no es válida. Intentá nuevamente.",
          },
          { status: 403 },
        );
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company: company || null,
        message,
      },
    });

    await recordLeadActivity({
      leadId: lead.id,
      type: "LEAD_CREATED",
      message: "Lead creado.",
    });

    after(async () => {
      await processLeadAnalysis(lead.id);
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Lead creation failed:", error);

    return NextResponse.json(
      { error: "No se pudo registrar el cliente." },
      { status: 500 },
    );
  }
}