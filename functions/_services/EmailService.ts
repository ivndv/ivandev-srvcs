import { Resend } from "resend";
import type { ContactPayload, Env, IEmailService } from "../_shared/types";

/**
 * Genera la plantilla HTML estructurada para la notificación del lead
 */
function buildContactEmail(
	nombre: string,
	email: string,
	servicio: string,
	mensaje: string,
): string {
	return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
				<style>
					body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
					.container { max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
					.header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
					.content { background: #ffffff; padding: 32px; }
					.field { margin-bottom: 24px; }
					.label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
					.value { background: #f8fafc; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #3b82f6; font-size: 15px; }
					.footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h2 style="margin: 0; font-size: 20px;">Nuevo Mensaje de Contacto</h2>
					</div>
					<div class="content">
						<div class="field">
							<div class="label">Nombre:</div>
							<div class="value">${nombre}</div>
						</div>
						<div class="field">
							<div class="label">Email:</div>
							<div class="value"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></div>
						</div>
						<div class="field">
							<div class="label">Interés:</div>
							<div class="value">${servicio}</div>
						</div>
						<div class="field">
							<div class="label">Mensaje:</div>
							<div class="value">${mensaje.replace(/\n/g, "<br>")}</div>
						</div>
					</div>
					<div class="footer">
						Mensaje recibido desde portafolio web (ivandev-srvcs)
					</div>
				</div>
			</body>
		</html>
	`;
}

/**
 * Servicio para el envío de correos electrónicos transaccionales usando Resend.
 */
export class EmailService implements IEmailService {
	/**
	 * Envía un correo de notificación de contacto al destinatario configurado.
	 */
	public async send(data: ContactPayload, env: Env): Promise<boolean> {
		// 1. Valida que las variables de entorno existan
		if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.TO_EMAIL) {
			console.error("[EmailService] Faltan variables de entorno para Resend.");
			return false;
		}

		try {
			// 2. Inicializa el cliente de Resend
			const resend = new Resend(env.RESEND_API_KEY);

			// 3. Genera la plantilla HTML del mensaje
			const html = buildContactEmail(
				data.nombre,
				data.email,
				data.servicio,
				data.mensaje,
			);

			// 4. Envía el correo mediante la API de Resend
			const { error } = await resend.emails.send({
				from: env.FROM_EMAIL,
				to: env.TO_EMAIL,
				replyTo: data.email,
				subject: `Nuevo Lead: ${data.nombre} - ${data.servicio}`,
				html,
			});

			if (error) {
				console.error("[EmailService] Error retornado por Resend:", error);
				return false;
			}

			return true;
		} catch (err) {
			console.error("[EmailService] Excepción al enviar correo:", err);
			return false;
		}
	}
}

// Instancia singleton por defecto
export const emailService = new EmailService();
