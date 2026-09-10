import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type ActivityType =
  | "LEAD_CREATED"
  | "AI_COMPLETED"
  | "AI_FAILED"
  | "AI_RETRY"
  | "STATUS_CHANGED"
  | "NOTE_ADDED";

export async function recordLeadActivity({
  leadId,
  type,
  message,
  metadata,
}: {
  leadId: string;
  type: ActivityType;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.leadActivity.create({
      data: {
        leadId,
        type,
        message,
        ...(metadata !== undefined && { metadata }),
      },
    });
  } catch (error) {
    console.error("Failed to record lead activity:", error);
  }
}