import { OpenAPIHono } from "@hono/zod-openapi";
import { handle } from "hono/cloudflare-pages";
import {
	contactRoute,
	registerContactController,
} from "../_controllers/contactController";
import { registerDocsController } from "../_controllers/docsController";
import {
	healthRoute,
	registerHealthController,
} from "../_controllers/healthController";
import { registerErrors } from "../_middleware/errors";
import type { Env } from "../_shared/types";

// Instancia OpenAPIHono tipada con las variables de entorno de Cloudflare
export const app = new OpenAPIHono<{ Bindings: Env }>();

// Controladores
registerHealthController(app);
registerContactController(app);
registerDocsController(app);

// Middleware global de manejo de errores (404 y 500)
registerErrors(app);

// Re-exportación de rutas para clientes tipados RPC si se requieren
export { contactRoute, healthRoute };

// Handler para Cloudflare Pages Functions
export const onRequest = handle(app);
