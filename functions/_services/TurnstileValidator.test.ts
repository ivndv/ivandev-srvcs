import { beforeEach, describe, expect, it, vi } from "vitest";
import { TurnstileValidator } from "./TurnstileValidator";

describe("TurnstileValidator", () => {
	let validator: TurnstileValidator;

	beforeEach(() => {
		validator = new TurnstileValidator();
		vi.restoreAllMocks();
	});

	it("retorna false si el token o el secretKey están vacíos", async () => {
		expect(await validator.verify("", "secret")).toBe(false);
		expect(await validator.verify("token", "")).toBe(false);
	});

	it("retorna true cuando la API de Turnstile responde con success: true", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});

		const isValid = await validator.verify(
			"valid_token",
			"valid_secret",
			"1.1.1.1",
		);
		expect(isValid).toBe(true);
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("retorna false cuando la API de Turnstile responde con success: false", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				success: false,
				"error-codes": ["invalid-input-response"],
			}),
		});

		const isValid = await validator.verify("invalid_token", "valid_secret");
		expect(isValid).toBe(false);
	});

	it("retorna false si ocurre un error de red o excepción en fetch", async () => {
		globalThis.fetch = vi
			.fn()
			.mockRejectedValue(new Error("Network connection error"));

		const isValid = await validator.verify("token", "secret");
		expect(isValid).toBe(false);
	});
});
