import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type LeadAnalysis = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  summary: string;
  recommendation: string;
};

const models = ["gemini-3.8-flash", "gemini-3.7-flash"];

export async function analyzeLead(input: {
  name: string;
  company?: string | null;
  message: string;
}): Promise<LeadAnalysis> {
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `
Analiza este potencial cliente comercial.

Nombre: ${input.name}
Empresa: ${input.company || "No informada"}
Mensaje: ${input.message}

Clasificá la oportunidad pensando como un equipo comercial.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              priority: {
                type: "string",
                enum: ["HIGH", "MEDIUM", "LOW"],
              },
              category: {
                type: "string",
              },
              summary: {
                type: "string",
              },
              recommendation: {
                type: "string",
              },
            },
            required: [
              "priority",
              "category",
              "summary",
              "recommendation",
            ],
          },
        },
      });

      if (!response.text) {
        throw new Error("La IA no devolvió contenido.");
      }

      return JSON.parse(response.text) as LeadAnalysis;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}