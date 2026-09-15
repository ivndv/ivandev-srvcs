// Proyecto del portafolio
export interface Project {
	titulo: string;
	desc: {
		es: string;
		en: string;
	};
	img: string;
	tags: string[];
	live: string;
	repo: string;
}

// Datos del formulario de contacto
export interface ContactFormData {
	nombre: string;
	email: string;
	servicio: string;
	mensaje: string;
	fax_number?: string;
	"cf-turnstile-response"?: string;
}
