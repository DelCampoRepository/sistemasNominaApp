import * as Network from "expo-network";
import { useConexionStore } from "../store/useConexionStore";

// Si el estado no se puede determinar (algunos dispositivos/emuladores no
// reportan isInternetReachable) no bloqueamos la operación: solo bloqueamos
// cuando estamos seguros de que no hay conexión.
export async function hayConexion() {
  try {
    const estado = await Network.getNetworkStateAsync();
    return !!estado.isConnected && estado.isInternetReachable !== false;
  } catch (error) {
    return true;
  }
}

// Verifica la conexión antes de ejecutar una consulta a la API. Si no hay
// internet, muestra el modal global de "sin conexión" y devuelve false para
// que el llamador corte la ejecución sin disparar el fetch.
export async function asegurarConexion() {
  const conectado = await hayConexion();

  if (!conectado) {
    useConexionStore.getState().mostrarSinConexion();
  }

  return conectado;
}
