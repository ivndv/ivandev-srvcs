export type Theme = "nord" | "business";
export type Lang = "es" | "en";

export interface PreferencesState {
	theme: Theme;
	lang: Lang;
}

export interface PreferencesActions {
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	setLang: (lang: Lang) => void;
}

export type PreferencesSlice = PreferencesState & PreferencesActions;

// Aplica el tema visual al elemento <html>
export function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.setAttribute("data-theme", theme);
	root.classList.toggle("dark", theme === "business");
}

export const createPreferencesSlice = (
	set: (fn: (state: PreferencesSlice) => Partial<PreferencesSlice>) => void,
	get: () => PreferencesSlice,
): PreferencesSlice => ({
	theme: "nord",
	lang: "es",
	setTheme: (theme) => {
		set(() => ({ theme }));
		applyTheme(theme);
	},
	toggleTheme: () => {
		const nextTheme = get().theme === "nord" ? "business" : "nord";
		set(() => ({ theme: nextTheme }));
		applyTheme(nextTheme);
	},
	setLang: (lang) => set(() => ({ lang })),
});
