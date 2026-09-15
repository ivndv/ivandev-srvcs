// @ts-check

// Integraciones
import sitemap from "@astrojs/sitemap";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
// Plugins de Vite
import tailwindcss from "@tailwindcss/vite";
// Astro
import { defineConfig } from "astro/config";

// Configuración de Astro — sitio estático multilingüe con Paraglide i18n
export default defineConfig({
	site: "https://web-portfolio.mgdc.site",
	prefetch: true,
	output: "static",

	// Integraciones
	integrations: [sitemap()],

	// Plugins de Vite
	vite: {
		plugins: [
			tailwindcss(),
			paraglideVitePlugin({
				project: "./project.inlang",
				outdir: "./src/paraglide",
				emitTsDeclarations: true,
				strategy: ["url", "globalVariable", "baseLocale"],
				trailingSlash: "always",
				urlPatterns: [
					{
						pattern: "/:path(.*)?",
						localized: [
							["en", "/en/:path(.*)?"],
							["es", "/:path(.*)?"],
						],
					},
				],
			}),
		],
	},

	// i18n — español por defecto, inglés como alternativa
	i18n: {
		defaultLocale: "es",
		locales: ["es", "en"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
