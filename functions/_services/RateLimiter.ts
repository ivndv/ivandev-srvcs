import type { IRateLimiter } from "../_shared/types";

interface RateLimitRecord {
	count: number;
	resetAt: number;
}

/**
 * Servicio de control de tráfico y límite de peticiones por IP (Rate Limiter).
 */
export class RateLimiter implements IRateLimiter {
	private readonly maxRequests: number;
	private readonly windowMs: number;
	private requests: Map<string, RateLimitRecord>;

	constructor(maxRequests = 5, windowMs = 60_000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
		this.requests = new Map<string, RateLimitRecord>();
	}

	/**
	 * Verifica si una dirección IP tiene permitido realizar una solicitud.
	 */
	public isAllowed(ip: string): boolean {
		const now = Date.now();
		const record = this.requests.get(ip);

		// 1. Si no existe registro o la ventana expiró, crea un nuevo ciclo
		if (!record || now > record.resetAt) {
			this.requests.set(ip, {
				count: 1,
				resetAt: now + this.windowMs,
			});
			return true;
		}

		// 2. Si excedió el límite máximo permitido dentro de la ventana
		if (record.count >= this.maxRequests) {
			return false;
		}

		// 3. Incrementa el contador y permite la solicitud
		record.count += 1;
		return true;
	}

	/**
	 * Limpia los registros en memoria (útil para pruebas y reinicios)
	 */
	public reset(): void {
		this.requests.clear();
	}
}

// Instancia singleton por defecto para el runtime
export const rateLimiter = new RateLimiter();
