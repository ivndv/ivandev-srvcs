import { swaggerUI } from "@hono/swagger-ui";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "../_shared/types";

/**
 * Registra los endpoints de documentación interactiva:
 * - GET /api/openapi: Especificación OpenAPI 3.0 en formato JSON
 * - GET /api/docs: Interfaz gráfica Swagger UI interactiva para explorar y probar endpoints
 */
export function registerDocsController(app: OpenAPIHono<{ Bindings: Env }>) {
	app.doc("/api/openapi", {
		openapi: "3.0.0",
		info: {
			title: "ivandev-srvcs API",
			version: "1.0.0",
			description:
				"API serverless en Cloudflare Pages Functions para el portafolio web de servicios. Incluye endpoints de salud y contacto con protección Turnstile y envío vía Resend.",
		},
		servers: [
			{ url: "https://web-portfolio.mgdc.site", description: "Producción" },
			{ url: "http://localhost:4321", description: "Desarrollo Local" },
		],
	});

	app.get("/api/docs", swaggerUI({ url: "/api/openapi" }));
}
