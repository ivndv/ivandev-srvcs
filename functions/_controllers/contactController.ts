import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import type { Context } from "hono";
import { emailService as defaultEmailService } from "../_services/EmailService";
import { rateLimiter as defaultRateLimiter } from "../_services/RateLimiter";
import { turnstileValidator as defaultTurnstileValidator } from "../_services/TurnstileValidator";
import { apiResponseSchema, contactSchema } from "../_shared/contactSchema";
import type {
	ApiResponse,
	ContactRequestBody,
	Env,
	IEmailService,
	IRateLimiter,
	ITurnstileValidator,
} from "../_shared/types";

export interface ContactControllerDependencies {
	rateLimiter?: IRateLimiter;
	turnstileValidator?: ITurnstileValidator;
	emailService?: IEmailService;
}

// Ruta OpenAPI: POST /api/send-email
export const contactRoute = createRoute({
	method: "post",
	path: "/api/send-email",
	tags: ["Contacto"],
	summary: "Enviar formulario de contacto",
	description:
		"Procesa el formulario validando honeypot, tasa de peticiones, captcha Cloudflare Turnstile y enviando notificación vía Resend.",
	request: {
		body: {
			content: { "application/json": { schema: contactSchema } },
		},
	},
	responses: {
		200: {
			content: { "application/json": { schema: apiResponseSchema } },
			description: "Mensaje enviado exitosamente o honeypot neutralizado",
		},
		400: {
			content: { "application/json": { schema: apiResponseSchema } },
			description: "Datos inválidos o verificación de captcha fallida",
		},
		429: {
			content: { "application/json": { schema: apiResponseSchema } },
			description: "Límite de tasa de solicitudes excedido",
		},
		500: {
			content: { "application/json": { schema: apiResponseSchema } },
			description: "Error interno del servidor al enviar el correo",
		},
	},
});

/**
 * Controlador para el endpoint de contacto (POST /api/send-email).
 * Orquesta honeypot, rate limiting, captcha Turnstile y envío con Resend.
 */
export const createContactHandler = (
	deps: ContactControllerDependencies = {},
) => {
	const limiter = deps.rateLimiter || defaultRateLimiter;
	const turnstile = deps.turnstileValidator || defaultTurnstileValidator;
	const email = deps.emailService || defaultEmailService;

	return async (c: Context<{ Bindings: Env }>) => {
		// 1. Obtiene la dirección IP del cliente
		const ip =
			c.req.header("cf-connecting-ip") ||
			c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
			"unknown";

		// 2. Extrae los datos validados por zValidator
		const body = c.req.valid("json" as never) as ContactRequestBody;

		// 3. Detección de Bot vía Honeypot (campo oculto con valor)
		if (body.fax_number) {
			return c.json<ApiResponse>(
				{
					success: true,
					message: "Enviado",
				},
				200,
			);
		}

		// 4. Control de tráfico por IP (Rate Limiter)
		if (!limiter.isAllowed(ip)) {
			return c.json<ApiResponse>(
				{
					success: false,
					error: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
				},
				429,
			);
		}

		// 5. Verificación de seguridad anti-spam con Cloudflare Turnstile
		const turnstileToken = body["cf-turnstile-response"];
		const isTurnstileValid = await turnstile.verify(
			turnstileToken,
			c.env.TURNSTILE_SECRET_KEY,
			ip,
		);

		if (!isTurnstileValid) {
			return c.json<ApiResponse>(
				{
					success: false,
					error:
						"La verificación de seguridad falló. Por favor, inténtalo de nuevo.",
				},
				400,
			);
		}

		// 6. Envío del correo electrónico mediante Resend
		const isSent = await email.send(
			{
				nombre: body.nombre,
				email: body.email,
				servicio: body.servicio,
				mensaje: body.mensaje,
			},
			c.env,
		);

		if (!isSent) {
			return c.json<ApiResponse>(
				{
					success: false,
					error: "Error al enviar el mensaje. Intenta de nuevo más tarde.",
				},
				500,
			);
		}

		// 7. Respuesta exitosa uniforme
		return c.json<ApiResponse>(
			{
				success: true,
				message: "Mensaje enviado correctamente. Me pondré en contacto pronto.",
			},
			200,
		);
	};
};

export const handleContact = createContactHandler();

/**
 * Registra el endpoint de contacto OpenAPI en la aplicación.
 */
export function registerContactController(app: OpenAPIHono<{ Bindings: Env }>) {
	app.openapi(contactRoute, handleContact as never);
}
