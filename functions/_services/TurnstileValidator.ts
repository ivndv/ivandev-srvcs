import type { ITurnstileValidator } from "../_shared/types";

interface TurnstileVerifyResponse {
	success: boolean;
	"error-codes"?: string[];
	challenge_ts?: string;
	hostname?: string;
}

/**
 * Servicio de verificación de tokens anti-spam con Cloudflare Turnstile.
 */
export class TurnstileValidator implements ITurnstileValidator {
	private readonly verifyUrl: string;

	constructor(
		verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify",
	) {
		this.verifyUrl = verifyUrl;
	}

	/**
	 * Valida el token emitido por el widget de Turnstile contra los servidores de Cloudflare.
	 */
	public async verify(
		token: string,
		secretKey: string,
		ip?: string,
	): Promise<boolean> {
		// 1. Si no hay token o secret key, rechaza inmediatamente
		if (!token || !secretKey) {
			return false;
		}

		try {
			// 2. Prepara el cuerpo de la petición URL-encoded
			const formData = new URLSearchParams();
			formData.append("secret", secretKey);
			formData.append("response", token);
			if (ip) {
				formData.append("remoteip", ip);
			}

			// 3. Envía la solicitud de verificación
			const response = await fetch(this.verifyUrl, {
				method: "POST",
				body: formData,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});

			// 4. Evalúa la respuesta del servicio
			if (!response.ok) {
				return false;
			}

			const data = (await response.json()) as TurnstileVerifyResponse;
			return Boolean(data.success);
		} catch (error) {
			console.error("[TurnstileValidator] Error al verificar token:", error);
			return false;
		}
	}
}

// Instancia singleton por defecto
export const turnstileValidator = new TurnstileValidator();
