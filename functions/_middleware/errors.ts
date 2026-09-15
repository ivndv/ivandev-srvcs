import type { Hono } from "hono";
import type { Env } from "../_shared/types";

/**
 * Registra manejadores globales de error en Hono:
 * - notFound (404): Devuelve JSON estructurado en lugar de texto plano o HTML.
 * - onError (500): Captura excepciones no controladas y previene fuga de datos sensibles.
 */
export function registerErrors(app: Hono<{ Bindings: Env }>) {
	app.notFound((c) => {
		return c.json(
			{
				success: false,
				error: "Ruta no encontrada",
				path: c.req.path,
			},
			404,
		);
	});

	app.onError((err, c) => {
		console.error("[API_ERROR]", err);
		return c.json(
			{
				success: false,
				error: "Error interno del servidor",
			},
			500,
		);
	});
}
