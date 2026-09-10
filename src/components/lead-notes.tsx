"use client";

import { FormEvent, useEffect, useState } from "react";

type LeadNote = {
  id: string;
  content: string;
  createdAt: string;
  leadId: string;
};

export function LeadNotes({ leadId }: { leadId: string }) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadNotes() {
      setLoading(true);

      const response = await fetch(
        `/api/leads/notes?leadId=${encodeURIComponent(leadId)}`,
      );

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }

      setLoading(false);
    }

    loadNotes();
  }, [leadId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    setSaving(true);

    const response = await fetch("/api/leads/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId,
        content,
      }),
    });

    if (response.ok) {
      const newNote = await response.json();

      setNotes((current) => [newNote, ...current]);
      setContent("");
    }

    setSaving(false);
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <h3 className="text-lg font-semibold">Notas internas</h3>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Ej: Lo llamé y pidió presupuesto..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          disabled={saving}
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Agregar"}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando notas...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-400">
            Todavía no hay notas internas.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p>{note.content}</p>

              <p className="mt-2 text-xs text-slate-500">
                {new Date(note.createdAt).toLocaleString("es-AR")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}