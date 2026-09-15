import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import { healthResponseSchema } from "../_shared/contactSchema";
import type { Env } from "../_shared/types";

// Ruta OpenAPI: GET /api/health
export const healthRoute = createRoute({
	method: "get",
	path: "/api/health",
	tags: ["Sistema"],
	summary: "Comprobación de estado",
	description: "Verifica la disponibilidad operativa del backend edge.",
	responses: {
		200: {
			content: { "application/json": { schema: healthResponseSchema } },
			description: "Servicio activo y saludable",
		},
	},
});

export const handleHealth = (c: {
	json: (data: { status: "ok" }) => Response;
}) => c.json({ status: "ok" });

/**
 * Registra el controlador de comprobación de estado en la aplicación.
 */
export function registerHealthController(app: OpenAPIHono<{ Bindings: Env }>) {
	app.openapi(healthRoute, (c) => c.json({ status: "ok" }));
}
