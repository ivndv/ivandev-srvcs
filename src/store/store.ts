import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import {
	createPreferencesSlice,
	type PreferencesSlice,
} from "./slices/preferencesSlice";

export type StoreState = PreferencesSlice;

export const preferencesStore = createStore<StoreState>()(
	persist(
		(...a) => ({
			...createPreferencesSlice(...a),
		}),
		{
			name: "preferences",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				theme: state.theme,
				lang: state.lang,
			}),
		},
	),
);
