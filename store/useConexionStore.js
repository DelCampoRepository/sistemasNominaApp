import { create } from "zustand";

// Estado global para el modal de "sin conexión". Permite que cualquier
// servicio (apiClient, services.js, etc.) bloquee una consulta a la API y
// avise al usuario sin tener que pasar props ni depender de la pantalla
// activa.
export const useConexionStore = create((set) => ({
  sinConexionVisible: false,

  mostrarSinConexion: () => set({ sinConexionVisible: true }),
  ocultarSinConexion: () => set({ sinConexionVisible: false })
}));
