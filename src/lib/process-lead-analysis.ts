import { analyzeLead } from "@/lib/gemini";
import { recordLeadActivity } from "@/lib/lead-activity";
import { prisma } from "@/lib/prisma";

const retryDelays = [2000, 5000, 10000];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function processLeadAnalysis(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return;
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      analysisStatus: "PROCESSING",
      analysisError: null,
    },
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          analysisAttempts: {
            increment: 1,
          },
        },
      });

      const analysis = await analyzeLead({
        name: lead.name,
        company: lead.company,
        message: lead.message,
      });

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          priority: analysis.priority,
          category: analysis.category,
          summary: analysis.summary,
          recommendation: analysis.recommendation,
          analysisStatus: "COMPLETED",
          analysisError: null,
        },
      });

      await recordLeadActivity({
        leadId,
        type: "AI_COMPLETED",
        message: "La IA completó el análisis del lead.",
        metadata: {
          priority: analysis.priority,
          category: analysis.category,
          attempt: attempt + 1,
        },
      });

      return;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      console.error(
        `AI analysis attempt ${attempt + 1} failed for lead ${leadId}:`,
        errorMessage,
      );

      if (attempt < 2) {
        await wait(retryDelays[attempt]);
      } else {
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            analysisStatus: "FAILED",
            analysisError: errorMessage,
          },
        });

        await recordLeadActivity({
          leadId,
          type: "AI_FAILED",
          message: "La IA no pudo completar el análisis.",
          metadata: {
            attempts: 3,
            error: errorMessage,
          },
        });
      }
    }
  }
}