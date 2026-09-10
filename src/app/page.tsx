"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { FormEvent, useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess(false);
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const company = form.company.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (message.length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    if (
      name.length > 80 ||
      email.length > 254 ||
      company.length > 120 ||
      message.length > 2000
    ) {
      setError("Uno de los campos supera el límite permitido.");
      return;
    }

    if (!turnstileToken) {
      setError("Completá la verificación de seguridad.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo enviar la consulta.");
        return;
      }

      setForm({
        name: "",
        email: "",
        company: "",
        message: "",
      });

      setTurnstileToken("");
      setTurnstileKey((current) => current + 1);
      setSuccess(true);
    } catch (error) {
      console.error("Lead submission failed:", error);
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
        <div className="w-full">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            LeadPilot AI
          </p>

          <h1 className="text-4xl font-bold">
            Contanos qué necesita tu empresa
          </h1>

          <p className="mt-3 text-slate-400">
            Dejanos tus datos y una descripción de lo que necesitás.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
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
              rows={6}
              placeholder="¿Qué necesitás?"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <Turnstile
              key={turnstileKey}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />

            <button
              disabled={saving || !turnstileToken}
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Enviando..." : "Enviar consulta"}
            </button>

            {success && (
              <p className="text-sm text-green-400">
                Consulta enviada correctamente.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
