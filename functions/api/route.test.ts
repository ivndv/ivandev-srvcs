import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailService } from "../_services/EmailService";
import { rateLimiter } from "../_services/RateLimiter";
import { turnstileValidator } from "../_services/TurnstileValidator";
import { app } from "./[[route]]";

// Suite de pruebas para las rutas HTTP de la API serverless en Hono
describe("Hono API routes (Rutas del Backend)", () => {
	const mockEnv = {
		RESEND_API_KEY: "test-resend-key",
		FROM_EMAIL: "from@example.com",
		TO_EMAIL: "contact@example.com",
		TURNSTILE_SECRET_KEY: "test-turnstile-secret",
	};

	beforeEach(() => {
		vi.restoreAllMocks();
		rateLimiter.reset();
	});

	it("GET /api/health retorna estado 200 y JSON con status ok", async () => {
		const res = await app.request("/api/health");
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data).toEqual({ status: "ok" });
	});

	it("POST /api/send-email retorna 400 cuando el cuerpo no cumple el esquema Zod", async () => {
		vi.spyOn(rateLimiter, "isAllowed").mockReturnValue(true);

		const res = await app.request(
			"/api/send-email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nombre: "I",
					email: "invalido",
				}),
			},
			mockEnv,
		);

		expect(res.status).toBe(400);
	});

	it("POST /api/send-email con honeypot retorna 200 simulado sin procesar Turnstile ni Email", async () => {
		const turnstileSpy = vi.spyOn(turnstileValidator, "verify");
		const emailSpy = vi.spyOn(emailService, "send");

		const res = await app.request(
			"/api/send-email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nombre: "Bot User",
					email: "bot@example.com",
					servicio: "Web",
					mensaje: "Mensaje válido de prueba con más de diez caracteres",
					fax_number: "spam-bot", // Honeypot activo
					"cf-turnstile-response": "token",
				}),
			},
			mockEnv,
		);

		expect(res.status).toBe(200);
		const data = (await res.json()) as { success: boolean; message: string };
		expect(data.success).toBe(true);
		expect(data.message).toBe("Enviado");

		// Verifica que nunca tocó los servicios externos
		expect(turnstileSpy).not.toHaveBeenCalled();
		expect(emailSpy).not.toHaveBeenCalled();
	});

	it("POST /api/send-email retorna 429 cuando se excede la tasa de peticiones", async () => {
		vi.spyOn(rateLimiter, "isAllowed").mockReturnValue(false);

		const res = await app.request(
			"/api/send-email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nombre: "Valid Name",
					email: "valid@example.com",
					servicio: "Frontend",
					mensaje: "This is a valid message for testing.",
					"cf-turnstile-response": "valid-token",
				}),
			},
			mockEnv,
		);

		expect(res.status).toBe(429);
		const data = (await res.json()) as { error: string };
		expect(data.error).toContain("Demasiadas solicitudes");
	});

	it("POST /api/send-email retorna 400 cuando falla la verificación de Turnstile", async () => {
		vi.spyOn(rateLimiter, "isAllowed").mockReturnValue(true);
		vi.spyOn(turnstileValidator, "verify").mockResolvedValue(false);

		const res = await app.request(
			"/api/send-email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nombre: "Valid Name",
					email: "valid@example.com",
					servicio: "Frontend",
					mensaje: "This is a valid message for testing.",
					"cf-turnstile-response": "invalid-token",
				}),
			},
			mockEnv,
		);

		expect(res.status).toBe(400);
		const data = (await res.json()) as { error: string };
		expect(data.error).toContain("verificación de seguridad falló");
	});

	it("POST /api/send-email retorna 500 cuando el servicio de correo falla", async () => {
		vi.spyOn(rateLimiter, "isAllowed").mockReturnValue(true);
		vi.spyOn(turnstileValidator, "verify").mockResolvedValue(true);
		vi.spyOn(emailService, "send").mockResolvedValue(false);

		const res = await app.request(
			"/api/send-email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nombre: "Valid Name",
					email: "valid@example.com",
					servicio: "Frontend",
					mensaje: "This is a valid message for testing.",
					"cf-turnstile-response": "valid-token",
				}),
			},
			mockEnv,
		);

		expect(res.status).toBe(500);
		const data = (await res.json()) as { error: string };
		expect(data.error).toContain("Error al enviar el mensaje");
	});

	it("POST /api/send-email retorna 200 y confirmación cuando todo es exitoso", async () => {
		vi.spyOn(rateLimiter, "isAllowed").mockReturnValue(true);
		vi.spyOn(turnstileValidator, "verify").mockResolvedValue(true);
		vi.spyOn(emailService, "send").mockResolvedValue(true);

		const res = await app.request(
			"/api/send-email",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nombre: "Valid Name",
					email: "valid@example.com",
					servicio: "Frontend",
					mensaje: "This is a valid message for testing.",
					"cf-turnstile-response": "valid-token",
				}),
			},
			mockEnv,
		);

		expect(res.status).toBe(200);
		const data = (await res.json()) as { success: boolean; message: string };
		expect(data.success).toBe(true);
		expect(data.message).toContain("Mensaje enviado correctamente");
	});

	it("Rutas inexistentes retornan 404 en formato JSON estructurado", async () => {
		const res = await app.request("/api/ruta-inexistente");
		expect(res.status).toBe(404);

		const data = (await res.json()) as { success: boolean; error: string };
		expect(data.success).toBe(false);
		expect(data.error).toBe("Ruta no encontrada");
	});

	it("GET /api/openapi devuelve especificación OpenAPI 3.0 válida", async () => {
		const res = await app.request("/api/openapi");
		expect(res.status).toBe(200);

		const spec = (await res.json()) as {
			openapi: string;
			info: { title: string };
		};
		expect(spec.openapi).toBe("3.0.0");
		expect(spec.info.title).toBe("ivandev-srvcs API");
	});

	it("GET /api/docs responde 200 con la interfaz de Swagger UI", async () => {
		const res = await app.request("/api/docs");
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/html");
	});
});
