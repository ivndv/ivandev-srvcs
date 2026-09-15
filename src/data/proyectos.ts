// Tipos
import { ASSETS_BASE } from "../config/assets";
import type { Project } from "../types";

// Proyectos destacados del portafolio
export const proyectos: Project[] = [
	// Fluxbeats — plataforma de beats musicales
	{
		titulo: "Fluxbeats",
		desc: {
			es: "Fluxbeats es una aplicación web para mostrar un servicio de ventas de licencias de beats musicales libres de derechos de autor",
			en: "Fluxbeats is a web application to showcase a sales service for royalty-free musical beat licenses",
		},
		img: `${ASSETS_BASE}/fluxbeats.png`,
		tags: ["React", "Vite", "Tailwindcss", "Node.js", "Cloudflare"],
		live: "https://landing-page.mgdc.site/",
		repo: "https://github.com/Ivandv19/landing-page-1906",
	},

	// Fluxdev Blog — blog personal con Astro + D1
	{
		titulo: "Fluxdev Blog",
		desc: {
			es: "Blog personal y profesional construido con Astro y Cloudflare D1, enfocado en compartir conocimiento sobre desarrollo web y tecnología.",
			en: "Personal and professional blog built with Astro and Cloudflare D1, focused on sharing knowledge about web development and technology.",
		},
		img: `${ASSETS_BASE}/fluxdev.png`,
		tags: ["Astro", "Cloudflare", "D1 (SQLite)", "TailwindCSS"],
		live: "https://fluxdev.mgdc.site",
		repo: "https://github.com/Ivandv19/blog-personal-fluxdev",
	},
];
