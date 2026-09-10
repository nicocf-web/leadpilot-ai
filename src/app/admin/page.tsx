"use client";
import { LeadNotes } from "@/components/lead-notes";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LeadActivityTimeline } from "@/components/lead-activity-timeline";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED";
  priority: "HIGH" | "MEDIUM" | "LOW";

  category: string | null;
  summary: string | null;
  recommendation: string | null;

  analysisStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  analysisAttempts: number;
  analysisError: string | null;

  createdAt: string;
};

const priorityLabels = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export default function Home() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

useEffect(() => {
  async function loadLeads() {
    try {
      const response = await fetch("/api/leads", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los leads.");
      }

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  }

  loadLeads();
}, []);

  useEffect(() => {
    const hasPendingAnalysis = leads.some(
      (lead) =>
        lead.analysisStatus === "PENDING" ||
        lead.analysisStatus === "PROCESSING",
    );

    if (!hasPendingAnalysis) {
      return;
    }

    const interval = setInterval(async () => {
      const response = await fetch("/api/leads", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setLeads(data);

      if (selectedLead) {
        const updatedSelectedLead = data.find(
          (lead: Lead) => lead.id === selectedLead.id,
        );

        if (updatedSelectedLead) {
          setSelectedLead(updatedSelectedLead);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [leads, selectedLead]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      nuevos: leads.filter((lead) => lead.status === "NEW").length,
      alta: leads.filter((lead) => lead.priority === "HIGH").length,
    };
  }, [leads]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const newLead = await response.json();

      setLeads((current) => [newLead, ...current]);

      setForm({
        name: "",
        email: "",
        company: "",
        message: "",
      });
    }

    setSaving(false);
  }

  async function retryAnalysis(id: string) {
    const response = await fetch("/api/leads/retry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      return;
    }

    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              analysisStatus: "PROCESSING",
              analysisError: null,
            }
          : lead,
      ),
    );
  }
  async function updateLeadStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "QUALIFIED",
) {
  const response = await fetch("/api/leads/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, status }),
  });

  if (!response.ok) {
    return;
  }

  const updatedLead = await response.json();

  setLeads((current) =>
    current.map((lead) =>
      lead.id === id ? updatedLead : lead,
    ),
  );

  if (selectedLead?.id === id) {
    setSelectedLead(updatedLead);
  }
}
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            LeadPilot AI
          </p>

          <h1 className="text-4xl font-bold">
            Gestión inteligente de clientes
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Captura, organiza y analiza oportunidades comerciales desde un solo
            lugar.
          </p>

          <button
            onClick={handleLogout}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total de leads</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Nuevos</p>
            <p className="mt-2 text-3xl font-bold">{stats.nuevos}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Prioridad alta</p>
            <p className="mt-2 text-3xl font-bold">{stats.alta}</p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Nuevo cliente</h2>

            <p className="mt-1 text-sm text-slate-400">
              Registrá una nueva oportunidad.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                required
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Empresa"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <textarea
                required
                placeholder="¿Qué necesita el cliente?"
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                disabled={saving}
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Registrar lead"}
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-6">
              <h2 className="text-xl font-semibold">Oportunidades</h2>
              <p className="mt-1 text-sm text-slate-400">
                Clientes registrados en el sistema.
              </p>
            </div>

            {loading ? (
              <p className="p-6 text-slate-400">Cargando clientes...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-sm text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Empresa</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Prioridad</th>
                      <th className="px-6 py-4">IA</th>
                      <th className="px-6 py-4">Detalle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-slate-800 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-slate-400">
                            {lead.email}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {lead.company || "Sin empresa"}
                        </td>

<td className="px-6 py-4">
  <select
    value={lead.status}
    onChange={(e) =>
      updateLeadStatus(
        lead.id,
        e.target.value as "NEW" | "CONTACTED" | "QUALIFIED",
      )
    }
    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none"
  >
    <option value="NEW">Nuevo</option>
    <option value="CONTACTED">Contactado</option>
    <option value="QUALIFIED">Calificado</option>
  </select>
</td>

                        <td className="px-6 py-4">
                          {priorityLabels[lead.priority]}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span>{lead.analysisStatus}</span>

                            {lead.analysisStatus !== "COMPLETED" && (
                              <button
                                onClick={() => retryAnalysis(lead.id)}
                                className="rounded-lg bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
                              >
                                Reintentar
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="rounded-lg bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedLead && (
              <div className="border-t border-slate-800 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">
                      Análisis del lead
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {selectedLead.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedLead(null)}
                    className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-400">
                      Mensaje original
                    </p>
                    <p className="mt-2">{selectedLead.message}</p>
                  </div>
<LeadNotes leadId={selectedLead.id} />
<LeadActivityTimeline leadId={selectedLead.id} />
                  <div>
                    <p className="text-sm text-slate-400">Categoría</p>
                    <p className="mt-2">
                      {selectedLead.category || "Pendiente de análisis"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Resumen de IA
                    </p>
                    <p className="mt-2">
                      {selectedLead.summary || "Pendiente de análisis"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Recomendación
                    </p>
                    <p className="mt-2">
                      {selectedLead.recommendation ||
                        "Pendiente de análisis"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Intentos de IA
                    </p>
                    <p className="mt-2">
                      {selectedLead.analysisAttempts}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Estado del análisis
                    </p>
                    <p className="mt-2">
                      {selectedLead.analysisStatus}
                    </p>
                  </div>

                  {selectedLead.analysisError && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-400">
                        Último error de IA
                      </p>
                      <p className="mt-2 text-red-400">
                        {selectedLead.analysisError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}