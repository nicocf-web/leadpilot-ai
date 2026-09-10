"use client";

import { useEffect, useState } from "react";

type LeadActivity = {
  id: string;
  type:
    | "LEAD_CREATED"
    | "AI_COMPLETED"
    | "AI_FAILED"
    | "AI_RETRY"
    | "STATUS_CHANGED"
    | "NOTE_ADDED";
  message: string;
  metadata: unknown;
  createdAt: string;
  leadId: string;
};

const activityLabels = {
  LEAD_CREATED: "Lead creado",
  AI_COMPLETED: "IA completada",
  AI_FAILED: "IA fallida",
  AI_RETRY: "Reintento de IA",
  STATUS_CHANGED: "Cambio de estado",
  NOTE_ADDED: "Nota agregada",
};

export function LeadActivityTimeline({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      setLoading(true);

      const response = await fetch(
        `/api/leads/activities?leadId=${encodeURIComponent(leadId)}`,
        {
          cache: "no-store",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }

      setLoading(false);
    }

    loadActivities();
  }, [leadId]);

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <h3 className="text-lg font-semibold">Historial de actividad</h3>

      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando historial...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-slate-400">
            Todavía no hay actividad registrada.
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="border-l-2 border-slate-700 pl-4"
            >
              <p className="font-medium">
                {activityLabels[activity.type]}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {activity.message}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {new Date(activity.createdAt).toLocaleString("es-AR")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}