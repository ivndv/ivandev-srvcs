// ==============================================================================
// Tipos e Interfaces del Backend Serverless (Cloudflare Pages Functions)
// ==============================================================================

/**
 * Variables de entorno inyectadas por Cloudflare Pages Functions
 */
export interface Env {
	RESEND_API_KEY: string;
	FROM_EMAIL: string;
	TO_EMAIL: string;
	TURNSTILE_SECRET_KEY: string;
}

/**
 * Datos del formulario de contacto validados
 */
export interface ContactPayload {
	nombre: string;
	email: string;
	servicio: string;
	mensaje: string;
	fax_number?: string;
}

/**
 * Entrada completa recibida en la petición HTTP POST /api/send-email
 */
export interface ContactRequestBody extends ContactPayload {
	"cf-turnstile-response": string;
}

/**
 * Estructura estándar de respuesta JSON de la API
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	error?: string;
	data?: T;
	id?: string;
}

/**
 * Contrato (Interfaz) para el servicio de Rate Limiting
 */
export interface IRateLimiter {
	isAllowed(ip: string): boolean;
	reset(): void;
}

/**
 * Contrato (Interfaz) para el servicio de verificación de Turnstile
 */
export interface ITurnstileValidator {
	verify(token: string, secretKey: string, ip?: string): Promise<boolean>;
}

/**
 * Contrato (Interfaz) para el servicio de envío de correos electrónicos
 */
export interface IEmailService {
	send(data: ContactPayload, env: Env): Promise<boolean>;
}
