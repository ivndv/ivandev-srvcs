import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../_shared/types";
import { EmailService } from "./EmailService";

// Mock del SDK de Resend
const mockSend = vi.fn();
vi.mock("resend", () => {
	return {
		Resend: class {
			emails = {
				send: mockSend,
			};
		},
	};
});

describe("EmailService", () => {
	let service: EmailService;
	const mockEnv: Env = {
		RESEND_API_KEY: "re_mock_key",
		FROM_EMAIL: "noreply@mgdc.site",
		TO_EMAIL: "admin@mgdc.site",
		TURNSTILE_SECRET_KEY: "0x4AAA",
	};

	beforeEach(() => {
		service = new EmailService();
		vi.clearAllMocks();
	});

	it("retorna false si faltan variables de entorno para Resend", async () => {
		const incompleteEnv = { ...mockEnv, RESEND_API_KEY: "" };
		const result = await service.send(
			{
				nombre: "Test",
				email: "test@example.com",
				servicio: "Web",
				mensaje: "Mensaje de prueba",
			},
			incompleteEnv,
		);

		expect(result).toBe(false);
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("retorna true cuando Resend envía el correo exitosamente", async () => {
		mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

		const result = await service.send(
			{
				nombre: "Test",
				email: "test@example.com",
				servicio: "Web",
				mensaje: "Mensaje de prueba",
			},
			mockEnv,
		);

		expect(result).toBe(true);
		expect(mockSend).toHaveBeenCalledTimes(1);
	});

	it("retorna false cuando Resend devuelve un objeto de error", async () => {
		mockSend.mockResolvedValue({
			data: null,
			error: { message: "Invalid API key" },
		});

		const result = await service.send(
			{
				nombre: "Test",
				email: "test@example.com",
				servicio: "Web",
				mensaje: "Mensaje de prueba",
			},
			mockEnv,
		);

		expect(result).toBe(false);
	});
});
