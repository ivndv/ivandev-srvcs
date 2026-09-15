import { describe, expect, it } from "vitest";
import * as m from "../paraglide/messages";

describe("Paraglide i18n messages", () => {
	it("should translate nav_home in Spanish and English", () => {
		expect(m.nav_home({}, { locale: "es" })).toBe("Inicio");
		expect(m.nav_home({}, { locale: "en" })).toBe("Home");
	});

	it("should translate services_title in Spanish and English", () => {
		expect(m.services_title({}, { locale: "es" })).toBe("Soluciones Web");
		expect(m.services_title({}, { locale: "en" })).toBe("Web Solutions");
	});
});
