import { create } from "zustand";

// Cache reactivo, en memoria, del estado de sesión/patrón para esta ejecución
// de la app. La fuente de verdad persistente sigue siendo Realm (UserData /
// PatronSchema) y AsyncStorage (token) — este store solo evita reconsultar
// Realm en cada pantalla y permite que LoginScreen, HomeScreen y
// ConfiguracionScreen compartan el mismo dato sin pasarlo por props.
export const useSesionStore = create((set) => ({
  nombreUsuarioActivo: null,
  patronHabilitado: false,

  setNombreUsuarioActivo: (nombreUsuarioActivo) => set({ nombreUsuarioActivo }),
  setPatronHabilitado: (patronHabilitado) => set({ patronHabilitado }),

  limpiarSesion: () => set({ nombreUsuarioActivo: null, patronHabilitado: false })
}));
