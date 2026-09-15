# AGENTS.md — Guía para Agentes en ivandev-srvcs

Guía operativa y técnica para agentes de Inteligencia Artificial que colaboren en el desarrollo, mantenimiento y optimización del proyecto **ivandev-srvcs**.

---

## 1. Visión General del Proyecto

**ivandev-srvcs** es una plataforma web y portafolio profesional bilingüe (español e inglés) enfocado en la presentación y contratación de servicios de desarrollo de software, landing pages de alta conversión, menús digitales y aplicaciones web a medida para negocios, profesionales y startups.

* **Propósito:** Presentar el catálogo de servicios, casos de éxito, testimonios y capturar leads cualificados mediante un formulario de contacto seguro (protegido con honeypot y Cloudflare Turnstile) conectado a Cloudflare Pages Functions y Resend.
* **Dominio en Producción:** [https://web-portfolio.mgdc.site](https://web-portfolio.mgdc.site)
* **Repositorio:** [https://github.com/ivndv/ivandev-srvcs](https://github.com/ivndv/ivandev-srvcs)

---

## 2. Antes de Tocar Código (CodeGraph)

* **Uso del MCP CodeGraph:** Antes de realizar búsquedas a ciegas o modificar múltiples archivos, utiliza la herramienta `codegraph_explore` para inspeccionar la arquitectura, dependencias y relaciones entre símbolos de forma precisa.
* **Comandos de Mantenimiento de CodeGraph:**
  ```bash
  # Verificar estado del índice de código
  codegraph status /home/ivan/software-dev/ivandev-srvcs

  # Sincronizar cambios en el árbol de archivos
  codegraph sync /home/ivan/software-dev/ivandev-srvcs
  ```

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Runtime & Gestor** | **Bun** | `v1.3.14` (`bun.lock`) |
| **Lenguaje** | **TypeScript** | Modo estricto con `tsconfig.json` |
| **Frontend & SSG** | **Astro 7** | `astro ^7.3.2`, `@astrojs/sitemap ^3.7.4` |
| **Estilos & UI** | **Tailwind CSS 4** + **DaisyUI 5** | `@tailwindcss/vite ^4.3.3`, `daisyui ^5.7.38`, `@iconify/tailwind4 ^1.2.3` |
| **Fuentes** | **Fontsource Outfit** | `@fontsource/outfit ^5.3.0` |
| **Estado Global** | **Zustand 5** | `zustand ^5.0.15` (idioma y preferencias de tema) |
| **Backend / Edge API** | **Hono 4** en Cloudflare Pages Functions | `hono ^4.13.8` en `functions/api/[[route]].ts` |
| **Servicio de Email** | **Resend SDK** | `resend ^6.28.1` (notificación de leads a bandeja administrativa) |
| **Seguridad & Anti-Bot** | **Cloudflare Turnstile** + Honeypot | Verificación de tokens captcha del lado del servidor |
| **Validación de Esquemas** | **Zod 4** | `zod ^4.6.5` |
| **Analítica Web** | **Umami Analytics** | Script ligero sin cookies integrado en `Layout.astro` |
| **Linter & Formatter** | **Biome 2** | `@biomejs/biome ^2.5.13` (`biome.json`) |
| **Pruebas Unitarias** | **Vitest 5** + **JSDOM** | `vitest ^5.0.1`, `jsdom ^30.0.1`, `@testing-library/jest-dom ^7.0.1` |
| **Infraestructura Cloud** | **Cloudflare Pages** | `wrangler ^4.132.0` (`wrangler.json`, `nodejs_compat`) |
| **CI/CD** | **GitHub Actions** | Composite Action `.github/actions/setup`, Node 24 nativo |

---

## 4. Estructura del Código

```
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

---

## 5. Comandos de Desarrollo y Tooling

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

---

## 6. Arquitectura y Reglas de Negocio

### 6.1. Backend Desacoplado con Inyección de Dependencias
* Todo el backend en `functions/` está estructurado siguiendo principios SOLID:
  - `IEmailService`: Contrato abstracto para envío de correos (implementado por `ResendEmailService`).
  - `IVerificationService`: Contrato abstracto para validación anti-bot (implementado por `TurnstileVerificationService`).
  - `ContactService`: Orquestador que recibe las dependencias en su constructor (`new ContactService(emailService, verificationService)`), permitiendo tests unitarios con mocks sin tocar APIs externas.

### 6.2. Seguridad del Formulario de Contacto
El flujo del endpoint `POST /api/send-email` ejecuta 4 barreras de seguridad:
1. **Honeypot:** Campo oculto `_gotcha`. Si contiene algún valor, se simula éxito inmediato devolviendo 200 OK para neutralizar bots simples sin consumir recursos de red.
2. **Validación Zod:** `contact.validator.ts` valida nombres, emails con formato válido, longitud de mensaje y presencia del token `cf-turnstile-response`.
3. **Turnstile Siteverify:** Llamada directa a `https://challenges.cloudflare.com/turnstile/v0/siteverify` con el secreto `TURNSTILE_SECRET_KEY` y la IP remota del cliente (`CF-Connecting-IP`).
4. **Resend Email:** Envío de correo administrativo formateado con HTML responsive.

### 6.3. Optimización de Imágenes con Cloudflare
* El helper `getCloudflareImage` en `src/utils/images.ts` normaliza y genera URLs responsivas (`srcset` con 400w, 800w, 1200w) para consumir el optimizador de imágenes al vuelo de Cloudflare (`/cdn-cgi/image/format=auto,width=...`).

### 6.4. Internacionalización (i18n) con Paraglide JS
* La internacionalización utiliza **Paraglide JS** (`@inlang/paraglide-js`), integrado en Vite vía `paraglideVitePlugin` en `astro.config.mjs`.
* Los mensajes de traducción se definen en [`messages/es.json`](file:///home/ivan/software-dev/ivandev-srvcs/messages/es.json) (idioma origen) y [`messages/en.json`](file:///home/ivan/software-dev/ivandev-srvcs/messages/en.json).
* Las funciones de traducción fuertemente tipadas y tree-shakeable se importan desde `@/paraglide/messages` (`import * as m from "@/paraglide/messages"`).
* La ruta `/` sirve el contenido en **Español** (`defaultLocale`).
* La ruta `/en/` sirve el contenido en **Inglés**.

---

## 7. Protocolo de Git y Despliegue

* **Ramas Principales:**
  - `develop`: Rama de integración activa. Todos los cambios deben commitearse y probarse aquí primero.
  - `main`: Rama de producción. Solo se fusiona desde `develop` cuando `bun run check`, `bun run test` y `bun run build` pasen 100% en verde.
* **Pipeline de CI/CD:**
  - Pushes a `develop` o `main`: Ejecutan en paralelo `lint` y `test`.
  - Pushes a `main`: Al pasar `lint` y `test`, disparan el despliegue automático a Cloudflare Pages mediante `cloudflare/wrangler-action@v4`.
