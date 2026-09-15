import { describe, expect, it } from "vitest";
import { contactSchema } from "./contactSchema";

describe("contactSchema (Validación Zod)", () => {
	it("valida correctamente un objeto con todos los datos requeridos", () => {
		const validData = {
			nombre: "Ivan Cruz",
			email: "ivan@example.com",
			servicio: "Desarrollo Web",
			mensaje: "Hola, me gustaría cotizar una landing page.",
			"cf-turnstile-response": "token_valido_123",
		};

		const result = contactSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("falla si el nombre tiene menos de 2 caracteres", () => {
		const invalidData = {
			nombre: "I",
			email: "ivan@example.com",
			servicio: "Web",
			mensaje: "Mensaje válido de más de 10 caracteres.",
			"cf-turnstile-response": "token",
		};

		const result = contactSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("falla si el email no tiene formato válido", () => {
		const invalidData = {
			nombre: "Ivan Cruz",
			email: "no-es-un-correo",
			servicio: "Web",
			mensaje: "Mensaje válido de más de 10 caracteres.",
			"cf-turnstile-response": "token",
		};

		const result = contactSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("falla si no se proporciona el token de Turnstile", () => {
		const invalidData = {
			nombre: "Ivan Cruz",
			email: "ivan@example.com",
			servicio: "Web",
			mensaje: "Mensaje válido de más de 10 caracteres.",
			"cf-turnstile-response": "",
		};

		const result = contactSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});
