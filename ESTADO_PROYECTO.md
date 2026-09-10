# Estado del Proyecto — LeadPilot AI

Última actualización: 10/09/2026

## Objetivo del proyecto

LeadPilot AI es el Proyecto 1 de aprendizaje y portfolio.

Su función es recibir potenciales clientes desde un formulario público, guardarlos, analizarlos con IA y permitir administrarlos desde un panel privado.

El objetivo principal no es seguir convirtiéndolo en un CRM enorme, sino usarlo para aprender desarrollo Full-Stack, backend, APIs, bases de datos, seguridad, automatización e integración de IA.

## Estado actual

PROYECTO FUNCIONAL Y PUBLICADO EN PRODUCCIÓN.

URL:
https://leadpilot-ai-alpha.vercel.app/

Repositorio:
https://github.com/nicocf-web/leadpilot-ai

## Stack

- Next.js 16.3.4
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Supabase
- Prisma 7.10.0
- Google Gemini API
- Supabase Auth
- Cloudflare Turnstile
- Upstash Redis
- Vercel
- Git
- GitHub

## Flujo principal

Usuario
→ formulario público
→ Cloudflare Turnstile
→ rate limit con Upstash
→ API de Next.js
→ PostgreSQL/Supabase
→ Gemini analiza el lead
→ datos visibles en panel admin

## Funciones terminadas

### Formulario público

- Nombre
- Email
- Empresa
- Mensaje
- Validación del formulario
- Validación nuevamente en backend
- Cloudflare Turnstile
- Protección contra spam
- Rate limit

### Base de datos

Modelo Lead con:

- datos del cliente
- estado comercial
- prioridad
- categoría
- resumen de IA
- recomendación
- estado del análisis
- cantidad de intentos
- errores de IA
- timestamps

También existen:

- LeadNote
- LeadActivity

Relaciones:

Lead → muchas notas
Lead → muchas actividades

### Inteligencia artificial

Gemini analiza cada lead y devuelve:

- prioridad
- categoría
- resumen
- recomendación

Estados:

- PENDING
- PROCESSING
- COMPLETED
- FAILED

Tiene:

- reintentos automáticos
- varios intentos ante errores
- reintento manual
- registro de fallos
- procesamiento después de guardar el lead

### Panel administrador

Ruta:

/admin

Incluye:

- login
- logout
- lista de leads
- cantidad total
- leads nuevos
- prioridad alta
- cambio de estado
- detalle del lead
- análisis de IA
- notas internas
- historial de actividad
- reintento manual de IA

Estados comerciales:

- NEW
- CONTACTED
- QUALIFIED

### Historial

Se registran eventos como:

- LEAD_CREATED
- AI_COMPLETED
- AI_FAILED
- AI_RETRY
- STATUS_CHANGED
- NOTE_ADDED

### Seguridad

Implementado:

- Supabase Auth
- rutas administrativas protegidas
- APIs privadas protegidas
- Cloudflare Turnstile
- validación backend
- Upstash Redis rate limiting
- variables sensibles en .env
- secretos fuera de GitHub

Rate limit público:

5 solicitudes cada 10 minutos por IP.

Los administradores autenticados pueden crear leads sin Turnstile ni rate limit público.

## Deploy

El proyecto compila correctamente con:

npm run build

El build ejecuta:

prisma generate --config=prisma7.config.ts
next build

Git está conectado a GitHub.

Branch:

main

Vercel está conectado al repositorio y el proyecto está publicado.

## Pruebas de producción realizadas

Comprobado en Vercel:

- Turnstile funciona
- formulario público funciona
- lead se guarda
- Supabase recibe los datos
- Gemini analiza el lead
- reintentos funcionan
- login funciona
- admin funciona
- notas persisten
- cambios de estado persisten
- historial funciona
- datos permanecen después de F5

## Situación de aprendizaje

El proyecto fue construido principalmente siguiendo instrucciones de IA.

Haber utilizado una tecnología NO significa que el usuario ya sepa implementarla por sí mismo.

Conceptos que ya aparecieron durante el proyecto:

- frontend
- backend
- API
- GET / POST
- PostgreSQL
- Prisma
- migraciones
- prisma generate
- variables de entorno
- autenticación
- sesiones
- relaciones de base de datos
- integración de APIs de IA
- JSON estructurado
- reintentos
- manejo de errores
- procesamiento asíncrono
- polling
- rate limiting
- protección contra bots
- Git
- GitHub
- deployment

Estos conceptos deben reforzarse mediante repetición en futuros proyectos.

## Meta general

La meta no es solamente aprender programación.

La dirección profesional buscada es:

AI Solutions Developer

Especialización progresiva:

- Full-Stack
- backend
- bases de datos
- APIs
- automatización
- integración de IA
- debugging
- seguridad básica
- deployment

Objetivo comercial:

empezar a conseguir trabajos freelance reales mientras se continúa aprendiendo.

Progresión buscada:

IA = cerebro / usuario = brazo
→
usuario entiende dónde está el problema y trabaja junto con IA
→
usuario puede investigar, diagnosticar y resolver sistemas con IA como herramienta.

## Próximo paso

1. Crear README profesional para GitHub.
2. Commit + push del cierre.
3. Dar LeadPilot por terminado como Proyecto 1.
4. Prepararlo como pieza de portfolio.
5. Empezar búsqueda de trabajos freelance reales.
6. Diseñar Proyecto 2 con mayor dificultad y nuevos conceptos.

No agregar funciones innecesarias a LeadPilot salvo que aparezca un error importante o una mejora necesaria para portfolio.