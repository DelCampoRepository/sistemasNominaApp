import { Alert } from "react-native";
import { API_URL } from "../utils/constants";
import { asegurarConexion } from "../utils/conexion";

export const DEFAULT_TIMEOUT_MS = 12000;

let alertasSilenciadas = false;

// Permite que una pantalla (ej. LoadingScreen) capture los errores por su cuenta
// (para mostrarlos en su propia UI) sin que apiFetch muestre su Alert por encima.
export function setAlertasApiSilenciadas(valor) {
  alertasSilenciadas = valor;
}

export class ApiError extends Error {
  constructor(codigo, message, { status = null, cause = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.codigo = codigo; // "TIMEOUT" | "SIN_CONEXION" | "SESION_EXPIRADA" | "ERROR_SERVIDOR" | "HTTP_<status>" | "DESCONOCIDO"
    this.status = status;
    this.cause = cause;
  }
}

const MENSAJES = {
  TIMEOUT: "La consulta tardó demasiado en responder. Verifique su conexión e intente de nuevo.",
  SIN_CONEXION: "No se pudo conectar con el servidor. Verifique su conexión a internet.",
  SESION_EXPIRADA: "Sesión expirada, vuelva a iniciar sesión.",
  ERROR_SERVIDOR: "Error interno del servidor.",
  DESCONOCIDO: "Ocurrió un error inesperado al consultar el servidor."
};

async function extraerMensajeError(response) {
  try {
    const data = await response.json();
    if (data && (data.message || data.mensaje)) return data.message || data.mensaje;
  } catch (_) {
    // el cuerpo no era JSON
  }
  try {
    const text = await response.text();
    if (text) return text;
  } catch (_) {
    // el cuerpo ya fue consumido o no es texto
  }
  return `Error del servidor (código ${response.status}).`;
}

export async function apiFetch(path, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const conectado = await asegurarConexion();
  if (!conectado) {
    throw new ApiError("SIN_CONEXION", MENSAJES.SIN_CONEXION);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });

    if (response.status === 401) {
      throw new ApiError("SESION_EXPIRADA", MENSAJES.SESION_EXPIRADA, { status: 401 });
    }
    if (response.status === 500) {
      throw new ApiError("ERROR_SERVIDOR", MENSAJES.ERROR_SERVIDOR, { status: 500 });
    }
    if (!response.ok) {
      const msg = await extraerMensajeError(response);
      throw new ApiError(`HTTP_${response.status}`, msg, { status: response.status });
    }

    return await response.json();
  } catch (error) {
    let apiError;
    if (error instanceof ApiError) {
      apiError = error;
    } else if (error.name === "AbortError") {
      apiError = new ApiError("TIMEOUT", MENSAJES.TIMEOUT, { cause: error });
    } else if (error instanceof TypeError) {
      apiError = new ApiError("SIN_CONEXION", MENSAJES.SIN_CONEXION, { cause: error });
    } else {
      apiError = new ApiError("DESCONOCIDO", MENSAJES.DESCONOCIDO, { cause: error });
    }

    if (!alertasSilenciadas) {
      Alert.alert("Del Campo y Asociados", apiError.message);
    }
    throw apiError;
  } finally {
    clearTimeout(timeoutId);
  }
}
