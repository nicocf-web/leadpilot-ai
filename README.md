# LeadPilot AI

Sistema de gestión de oportunidades comerciales que captura leads desde un formulario público, los analiza automáticamente con IA y permite gestionarlos desde un panel privado.

## Demo

https://leadpilot-ai-alpha.vercel.app/

## Funcionalidades

- Captura de leads mediante formulario público
- Análisis automático con Google Gemini
- Clasificación por prioridad
- Categoría, resumen y recomendación generados por IA
- Reintentos automáticos cuando falla el proveedor de IA
- Panel administrativo privado
- Autenticación con Supabase Auth
- Cambio de estado comercial
- Notas internas por lead
- Historial completo de actividad
- Reintento manual del análisis de IA
- Protección contra bots con Cloudflare Turnstile
- Rate limiting con Upstash Redis
- Validación de datos en frontend y backend

## Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Supabase
- Prisma
- Google Gemini API
- Cloudflare Turnstile
- Upstash Redis
- Vercel

## Flujo

```text
Formulario público
        ↓
Cloudflare Turnstile
        ↓
Rate limiting
        ↓
Next.js API
        ↓
PostgreSQL / Supabase
        ↓
Google Gemini
        ↓
Panel administrativo