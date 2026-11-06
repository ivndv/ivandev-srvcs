# AGENTS.md — ivandev-srvcs

Guía operativa y técnica para agentes de IA que colaboran en el desarrollo, mantenimiento y optimización del proyecto.

## 1. Visión general

**ivandev-srvcs** es una plataforma web y portafolio profesional bilingüe (español e inglés) enfocado en la presentación y contratación de servicios de desarrollo de software, landing pages de alta conversión, menús digitales y aplicaciones web a medida para negocios, profesionales y startups.

- **Propósito:** presentar el catálogo de servicios, casos de éxito, testimonios y capturar leads cualificados mediante un formulario de contacto seguro (protegido con honeypot y Cloudflare Turnstile) conectado a Cloudflare Pages Functions y Resend.
- **Dominio en producción:** [https://web-portfolio.mgdc.site](https://web-portfolio.mgdc.site)
- **Repositorio:** [https://github.com/ivndv/ivandev-srvcs](https://github.com/ivndv/ivandev-srvcs)
- **Rutas:** `/` sirve el contenido en español (`defaultLocale`) y `/en/` en inglés; `404.astro` cubre los errores.

## 2. Antes de tocar código

**CodeGraph** (índice de símbolos del repo): usa `codegraph_explore` (`query`, `maxFiles`, `projectPath`) antes de un grep masivo o de leer varios archivos; devuelve fuente verbatim, rutas de llamada e impacto.

- `codegraph sync /home/ivan/software-dev/ivandev-srvcs` tras editar, pull o cambiar de rama (incremental, uso normal).
- `codegraph index /home/ivan/software-dev/ivandev-srvcs` solo al crear el índice, tras `codegraph upgrade` o si `status` avisa `built by vX` (rebuild completo).
- `codegraph status /home/ivan/software-dev/ivandev-srvcs` para comprobar el estado.

## 3. Stack tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime & Gestor** | **Bun** | `v1.3.14` (`bun.lock`) |
| **Lenguaje** | **TypeScript** | Modo estricto con `tsconfig.json` |
| **Frontend & SSG** | **Astro 7** | `astro ^7.3.2`, `@astrojs/sitemap ^3.7.4` |
| **Estilos & UI** | **Tailwind CSS 4** + **DaisyUI 5** | `@tailwindcss/vite ^4.3.3`, `daisyui ^5.7.38`, `@iconify/tailwind4 ^1.2.3` |
| **Fuentes** | **Fontsource Outfit** | `@fontsource/outfit ^5.3.0` |
| **Estado global** | **Zustand 5** | `zustand ^5.0.15` (idioma y preferencias de tema) |
| **Backend / Edge API** | **Hono 4** en Cloudflare Pages Functions | `hono ^4.13.8` en `functions/api/[[route]].ts` |
| **Servicio de email** | **Resend SDK** | `resend ^6.28.1` (notificación de leads a bandeja administrativa) |
| **Seguridad & anti-bot** | **Cloudflare Turnstile** + Honeypot | Verificación de tokens captcha del lado del servidor |
| **Validación de esquemas** | **Zod 4** | `zod ^4.6.5` |
| **Analítica web** | **Umami Analytics** | Script ligero sin cookies integrado en `Layout.astro` |
| **Linter & Formatter** | **Biome 2** | `@biomejs/biome ^2.5.13` (`biome.json`) |
| **Pruebas unitarias** | **Vitest 5** + **JSDOM** | `vitest ^5.0.1`, `jsdom ^30.0.1`, `@testing-library/jest-dom ^7.0.1` |
| **Infraestructura cloud** | **Cloudflare Pages** | `wrangler ^4.132.0` (`wrangler.json`, `nodejs_compat`) |
| **CI/CD** | **GitHub Actions** | Composite Action `.github/actions/setup`, Node 24 nativo |

## 4. Estructura del código

```plaintext
ivandev-srvcs/
├── functions/                              → Backend Edge Serverless (Cloudflare Pages Functions)
│   ├── _controllers/                       → Controladores HTTP con registro y OpenAPI
│   │   ├── contactController.ts            → Orquestador POST /api/send-email (Honeypot + RateLimiter + Turnstile + Resend)
│   │   ├── docsController.ts               → Documentación OpenAPI 3.0 (/api/openapi) y Swagger UI (/api/docs)
│   │   └── healthController.ts             → Comprobación de disponibilidad operativa GET /api/health
│   ├── _middleware/                        → Middlewares HTTP globales
│   │   └── errors.ts                       → Manejo uniforme de 404 (Not Found) y 500 (Server Error) en JSON
│   ├── _services/                          → Servicios desacoplados con suite de pruebas unitarias
│   │   ├── EmailService.ts                 → Servicio de correo con Resend SDK
│   │   ├── EmailService.test.ts            → Pruebas unitarias de EmailService
│   │   ├── RateLimiter.ts                  → Control de tráfico y límite de peticiones por IP
│   │   ├── RateLimiter.test.ts             → Pruebas unitarias de RateLimiter
│   │   ├── TurnstileValidator.ts           → Verificación de captcha anti-bot con Cloudflare Turnstile
│   │   └── TurnstileValidator.test.ts      → Pruebas unitarias de TurnstileValidator
│   ├── _shared/                            → Contratos, esquemas y tipos compartidos
│   │   ├── contactSchema.ts                → Esquemas Zod OpenAPI para validación y Swagger
│   │   ├── contactSchema.test.ts           → Pruebas unitarias de validación Zod
│   │   └── types.ts                        → Interfaces (Env, ApiResponse, IEmailService, etc.)
│   └── api/
│       ├── [[route]].ts                    → Router declarativo limpio (~30 líneas) montando controladores
│       └── route.test.ts                   → Pruebas de integración HTTP de la API (10 tests)
│
├── messages/                               → Archivos de traducción en formato Inlang JSON
│   ├── es.json                             → Mensajes en español (idioma origen)
│   └── en.json                             → Mensajes en inglés
├── project.inlang/                         → Configuración del proyecto Inlang / Paraglide JS
│   └── settings.json                       → Configuración de inlang (sourceLanguageTag: es)
│
├── src/                                    → Frontend Astro
│   ├── components/                         → Componentes de UI modulares (usando @/paraglide/messages)
│   │   ├── About.astro                     → Sección Sobre Mí y trayectoria
│   │   ├── Contact.astro                   → Formulario interactivo con Turnstile y feedback
│   │   ├── Footer.astro                    → Pie de página con enlaces de navegación y legales
│   │   ├── Hero.astro                      → Encabezado de impacto con llamada a la acción
│   │   ├── LanguagePicker.astro            → Selector interactivo de idioma (ES / EN)
│   │   ├── Projects.astro                  → Portafolio de proyectos destacados
│   │   ├── Services.astro                  → Catálogo de servicios y soluciones técnicas
│   │   ├── Testimonios.astro               → Reseñas y testimonios de clientes
│   │   └── ThemeToggle.astro               → Conmutador de tema claro/oscuro
│   ├── data/                               → Datos estructurados (servicios, proyectos, trayectoria)
│   │   └── proyectos.ts
│   ├── paraglide/                          → Funciones i18n compiladas automáticamente por Paraglide JS
│   │   ├── messages.js                     → Exportación de funciones m.*
│   │   └── runtime.js                      → Runtime y utilidades de idioma de Paraglide JS
│   ├── layouts/                            → Plantillas base
│   │   └── Layout.astro                    → Layout principal (HTML5, Meta SEO, OG, Twitter, Umami, ClientRouter)
│   ├── pages/                              → Rutas SSG unificadas i18n
│   │   ├── [...locale]/
│   │   │   └── index.astro                 → Landing principal unificada (`/` y `/en`) mediante getStaticPaths
│   │   └── 404.astro                       → Página de error 404 personalizada limpia
│   ├── store/                              → Estado global de cliente con Zustand (patrón Fluxblog)
│   │   ├── slices/
│   │   │   └── preferencesSlice.ts         → Slice de preferencias (tema e idioma)
│   │   └── store.ts                        → Instancia Zustand persistida en localStorage ("preferences")
│   ├── styles/                             → Estilos globales y temas
│   │   └── global.css                      → Importación de Tailwind 4 y DaisyUI 5
│   └── test/                               → Configuración y suite de pruebas unitarias
│       ├── paraglide.test.ts               → Pruebas unitarias de mensajes Paraglide JS (27 tests)
│       └── setup.ts                        → Setup de `@testing-library/jest-dom`
│
├── .github/                                → Flujos de CI/CD automatizados
│   ├── actions/setup/action.yml            → Composite Action (Node 24, Bun 1.3.14, caché de `bun.lock`)
│   └── workflows/ci-cd.yml                 → Pipeline de validación (`lint`, `test`) y `deploy` a Cloudflare Pages
│
├── public/                                 → Activos estáticos (favicons, imágenes OG, robots.txt)
├── biome.json                              → Configuración del linter y formateador Biome 2.5.13
├── package.json                            → Dependencias y scripts de ejecución
├── tsconfig.json                           → Configuración estricta de TypeScript
├── vitest.config.ts                        → Configuración de Vitest para pruebas unitarias
└── wrangler.json                           → Configuración de despliegue en Cloudflare Pages
```

## 5. Arquitectura y flujo de datos

### 5.1 Backend desacoplado con inyección de dependencias

Todo el backend en `functions/` sigue principios SOLID:

- `IEmailService`: contrato abstracto para envío de correos (implementado por `ResendEmailService`).
- `IVerificationService`: contrato abstracto para validación anti-bot (implementado por `TurnstileVerificationService`).
- `ContactService`: orquestador que recibe las dependencias en su constructor (`new ContactService(emailService, verificationService)`), lo que permite tests unitarios con mocks sin tocar APIs externas.

### 5.2 Seguridad del formulario de contacto

El endpoint `POST /api/send-email` ejecuta cuatro barreras:

1. **Honeypot:** campo oculto `_gotcha`. Si contiene algún valor, se simula éxito inmediato devolviendo 200 OK para neutralizar bots simples sin consumir recursos de red.
2. **Validación Zod:** los esquemas de `functions/_shared/contactSchema.ts` validan nombres, emails con formato válido, longitud de mensaje y presencia del token `cf-turnstile-response`.
3. **Turnstile Siteverify:** llamada directa a `https://challenges.cloudflare.com/turnstile/v0/siteverify` con el secreto `TURNSTILE_SECRET_KEY` y la IP remota del cliente (`CF-Connecting-IP`).
4. **Resend Email:** envío de correo administrativo formateado con HTML responsive.

Complementan el flujo el `RateLimiter` por IP y el manejo uniforme de errores 404/500 en JSON de `_middleware/errors.ts`.

### 5.3 Optimización de imágenes con Cloudflare

El helper `getCloudflareImage` en `src/utils/images.ts` normaliza y genera URLs responsivas (`srcset` con 400w, 800w, 1200w) para consumir el optimizador de imágenes al vuelo de Cloudflare (`/cdn-cgi/image/format=auto,width=...`).

### 5.4 Internacionalización con Paraglide JS

- **Paraglide JS** (`@inlang/paraglide-js`) se integra en Vite vía `paraglideVitePlugin` en `astro.config.mjs`.
- Los mensajes se definen en `messages/es.json` (idioma origen) y `messages/en.json`.
- Las funciones de traducción tipadas y tree-shakeable se importan desde `@/paraglide/messages` (`import * as m from "@/paraglide/messages"`).
- La ruta `/` sirve español (`defaultLocale`) y `/en/` sirve inglés.

## 6. Variables de entorno

Definidas como bindings de Cloudflare Pages Functions (`Env` en `functions/_shared/types.ts`):

| Variable | Descripción |
| :--- | :--- |
| `RESEND_API_KEY` | Clave de API de Resend para el envío de correos. |
| `FROM_EMAIL` | Dirección remitente del correo administrativo. |
| `TO_EMAIL` | Bandeja administrativa que recibe los leads. |
| `TURNSTILE_SECRET_KEY` | Secreto para verificar tokens de Cloudflare Turnstile. |

## 7. Comandos

Todos los comandos deben ejecutarse con **Bun**:

```bash
# Iniciar servidor de desarrollo en http://localhost:4321
bun run dev

# Compilar el sitio estático para producción (Astro 7)
bun run build

# Previsualizar el resultado de la compilación localmente
bun run preview

# Ejecutar validación de calidad y formato con Biome
bun run check

# Ejecutar únicamente el linter de Biome
bun run lint

# Formatear el código fuente con Biome
bun run format

# Ejecutar la suite de pruebas unitarias (Vitest)
bun run test
```

## 8. Convenciones y reglas críticas

- **Gestor de paquetes:** usa siempre **Bun**; no ejecutes `npm`, `yarn` ni `pnpm`.
- **Código generado:** `src/paraglide/` se compila automáticamente; no lo edites a mano.
- **Seguridad fail-closed:** no elimines ni relajes ninguna de las cuatro barreras de `POST /api/send-email` (honeypot, Zod, Turnstile, Resend) ni el `RateLimiter`.
- **Contratos de backend:** cualquier servicio nuevo debe depender de las interfaces (`IEmailService`, `IVerificationService`) y recibirse por constructor, no instanciarse dentro del orquestador.
- **i18n:** `messages/es.json` es el idioma origen; toda clave nueva debe existir también en `messages/en.json` y consumirse vía `m.*`.
- **Calidad:** el código debe pasar `bun run check`, `bun run test` y `bun run build` antes de fusionar.

## 9. Flujo de Git y despliegue

- **Prohibido realizar commits o push sin la confirmación y aprobación explícita del usuario.**
- **Ramas:**
  - `develop`: rama de integración activa. Todos los cambios se commitean y prueban aquí primero.
  - `main`: rama de producción. Solo se fusiona desde `develop` cuando `bun run check`, `bun run test` y `bun run build` pasan al 100 %, y con aprobación explícita.
- **Mensajes de commit:** Conventional Commits en minúsculas y español (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`, `refactor: ...`).

## 10. CI/CD

- Pushes a `develop` o `main` ejecutan en paralelo `lint` y `test`.
- Pushes a `main`: al pasar `lint` y `test`, se dispara el despliegue automático a Cloudflare Pages mediante `cloudflare/wrangler-action@v4`.
- El setup usa la Composite Action `.github/actions/setup` (Node 24, Bun 1.3.14, caché de `bun.lock`).
