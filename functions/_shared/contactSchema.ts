// Zod OpenAPI - Schema de validación y documentación de endpoints
import { z } from "@hono/zod-openapi";

// Schema de entrada del formulario de contacto
export const contactSchema = z
	.object({
		nombre: z
			.string()
			.min(2, "Nombre muy corto")
			.max(100, "Nombre muy largo")
			.openapi({
				example: "Ivan Cruz",
				description: "Nombre de la persona interesada",
			}),
		email: z.string().email("Email inválido").openapi({
			example: "contacto@mgdc.site",
			description: "Correo electrónico del contacto",
		}),
		servicio: z
			.string()
			.min(2, "Servicio no especificado")
			.max(100, "Servicio muy largo")
			.openapi({
				example: "Desarrollo Frontend",
				description: "Servicio de interés solicitado",
			}),
		mensaje: z
			.string()
			.min(10, "Mensaje muy corto")
			.max(1000, "Mensaje muy largo")
			.openapi({
				example: "Hola, me gustaría cotizar una landing page para mi negocio.",
				description: "Detalle o mensaje del lead",
			}),
		fax_number: z.string().optional().openapi({
			example: "",
			description: "Campo honeypot anti-bots (debe dejarse vacío)",
		}),
		"cf-turnstile-response": z
			.string()
			.min(1, "Verificación de humano requerida")
			.openapi({
				example: "0.mock_turnstile_token",
				description: "Token de seguridad emitido por Cloudflare Turnstile",
			}),
	})
	.openapi("ContactInput");

// Schema estándar de respuesta JSON de la API
export const apiResponseSchema = z
	.object({
		success: z.boolean().openapi({ example: true }),
		message: z
			.string()
			.optional()
			.openapi({ example: "Mensaje enviado correctamente" }),
		error: z.string().optional().openapi({ example: "Error de validación" }),
	})
	.openapi("ApiResponse");

// Schema de respuesta del endpoint de salud
export const healthResponseSchema = z
	.object({
		status: z.string().openapi({ example: "ok" }),
	})
	.openapi("HealthResponse");

// Tipo inferido del schema para usar en handlers y tests
export type ContactInput = z.infer<typeof contactSchema>;
