import { API_URL } from "../utils/constants";
import { startOfWeek, endOfWeek } from "date-fns";
import { getRealmInstance } from "../realm";
import { Alert } from "react-native";

export const login = async data => {
  const datacon = JSON.stringify(data);
  console.log(datacon);
  const response = await fetch(`${API_URL}/Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: datacon
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.message || "Error en la autenticación");
  }

  return await response.json();
};
export const obtenerSemanaActiva = async () => {
  const controller = new AbortController();
  const timeOutId = setTimeout(() => controller.abort(), 5000);
  try {
    let realmInstance = await getRealmInstance();
    const userData = realmInstance.objects("UserData");

    if (!userData || userData.length === 0) {
      Alert.alert(
        "Error",
        "los datos del usuario no existen en el dispositivo!"
      );
      return;
    }

    const token = userData[0].token;

    const response = await fetch(`${API_URL}/Semana`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      signal: controller.signal
    });

    const data = await response.json();

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("La petición superó el tiempo límite");
    } else {
      console.error("Error en la petición:", error);
    }
  } finally {
    clearTimeout(timeOutId);
    return null;
  }
};
export const obtenerNavesPorUsuario = async (codigo, temporada, token) => {
  try {
    const response = await fetch(`${API_URL}/Naves/${codigo}/${temporada}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    // console.log("📡 Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al obtener las naves del usuario"
      );
    }
    const d = await response.json();
    return d;
  } catch (error) {
    Alert.alert("Error", `${error}`);
    console.log(error);
  }
};

export const EnviarEmpleados = async (lista, token) => {
  //console.log("📤 BODY FINAL (ARRAY):", JSON.stringify(lista, null, 2));
  //console.log(JSON.stringify(lista));
  const response = await fetch(
    `${API_URL}/Actividades/GuardarActividadesJson`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(lista)
    }
  );

  const text = await response.text();
  // console.log("🧾 BACKEND RESPUESTA:", text);

  return response.ok ? JSON.parse(text) : null;
};
export const obtenerTablasPorUsuario = async (
  codigo,
  codigoTemporada,
  token
) => {
  const response = await fetch(
    `${API_URL}/Naves/ObtenerTablasDeNaves/${codigo}/${codigoTemporada}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al obtener las tablas del usuario"
    );
  }

  return await response.json();
};

export const obtenerActividadesPorUsuario = async (
  codigo,
  codigoTemporada,
  token
) => {
  const response = await fetch(
    `${API_URL}/Actividades/${codigo}/${codigoTemporada}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || "Error al obtener las actividades del usuario"
    );
  }

  return await response.json();
};

export const obtenerEmpleadosPorTemporada = async (temporada, token) => {
  const response = await fetch(`${API_URL}/Empleados/${temporada}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al obtener los empleados");
  }

  return await response.json();
};

export const guardarEmpleados = async (listaEmpleados, token) => {
  console.log("Enviando empleados a guardar:", listaEmpleados);

  const response = await fetch(`${API_URL}/empleados/guardar-empleados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(listaEmpleados, token)
  });
  //console.log(response, "sss")

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al guardar los empleados");
  }

  return await response.json();
};

export const ObtenerSurcosTrabajados = async params => {
  const response = await fetch(`${API_URL}/reportes/reporte-surcos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al Obtener los Surcos Trabajados"
    );
  }

  return await response.json();
};

export const obtenerReporteActividades = async parametros => {
  try {
    const respuesta = await fetch(`${API_URL}/reportes/reporte-actividades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parametros)
    });

    // Elimina o comenta esta línea: console.log("sssss", respuesta.blob());
    // Ya que quieres el JSON y no un Blob.

    if (!respuesta.ok) {
      // CORREGIDO: Usar 'respuesta' en lugar de 'response'
      // Intentar parsear el error del servidor si es JSON, o usar un mensaje genérico
      let errorData = {};
      try {
        errorData = await respuesta.json(); // Intentar obtener el cuerpo del error como JSON
      } catch (parseError) {
        // Si la respuesta de error no es JSON, usa un mensaje genérico
        console.error("Error parsing error response:", parseError);
        errorData.message = `HTTP error! Status: ${respuesta.status} - ${respuesta.statusText}`;
      }
      throw new Error(
        errorData.message ||
          `Error al obtener el reporte de actividades. Código: ${respuesta.status}`
      );
    }

    // CORREGIDO: Usar 'respuesta' en lugar de 'response'
    // Y esto es lo que finalmente retorna tu data JSON parseada
    const data = await respuesta.json();
    // console.log("Datos obtenidos del reporte de actividades:", data);
    return data;
  } catch (error) {
    console.error("Error en obtenerReporteActividades:", error.message);
    // Es importante re-lanzar el error para que pueda ser manejado por el llamador
    throw error;
  }
};

export const obtenerReporteEmpleados = async params => {
  // console.log("Enviando empleados a guardar:", params);

  const response = await fetch(`${API_URL}/empleados/reporte-empleados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al Obtener la lista de empleados."
    );
  }

  return await response.json();
};

export const registrarActividadEmpleado = async ({
  codigoEmpleado,
  nombre,
  codigoActividad,
  codigoLote,
  codigoNave,
  listaSurcos
}) => {
  const realm = await getRealmInstance();

  try {
    realm.write(() => {
      const empleadoExistente = realm.objectForPrimaryKey(
        "Empleado",
        codigoEmpleado
      );

      if (empleadoExistente) {
        // Actualiza los surcos
        empleadoExistente.surcos = listaSurcos.map(item => ({
          surco: item.surco,
          avance: item.avance
        }));
      } else {
        // Crea un nuevo empleado
        realm.create("Empleado", {
          CodigoEmpleado: codigoEmpleado,
          Nombre: nombre,
          CodigoActividad: codigoActividad,
          CodigoLote: codigoLote,
          CodigoNave: codigoNave,
          CodigoTemporada: "27",
          surcos: listaSurcos.map(item => ({
            surco: item.surco,
            avance: item.avance
          }))
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error en registrarActividadEmpleado:", error.message);
    return { success: false, error: error.message };
  }
};

export const registrarActividadEmpleadoPorSemana = async ({
  codigoEmpleado,
  nombre,
  codigoActividad,
  codigoLote,
  codigoNave,
  listaSurcos,
  fechaRegistro // Date actual
}) => {
  const realm = await getRealmInstance();
  const inicioSemana = startOfWeek(fechaRegistro, { weekStartsOn: 1 });
  const finSemana = endOfWeek(fechaRegistro, { weekStartsOn: 1 });

  try {
    const repetidos = [];
    const validos = [];

    // Tomamos todos los empleados para verificar globalmente
    const todosEmpleados = realm.objects("Empleado");

    (listaSurcos || []).forEach(item => {
      const yaUsado = todosEmpleados.some(emp =>
        (emp.surcos || []).some(s => {
          if (!s || s.surco == null) return false;
          const f = s.fecha ? new Date(s.fecha) : null;
          return (
            s.surco == item.surco && f && f >= inicioSemana && f <= finSemana
          );
        })
      );

      if (yaUsado) {
        repetidos.push(item.surco);
      } else {
        validos.push({
          surco: item.surco,
          avance: item.avance,
          fecha: fechaRegistro
        });
      }
    });

    if (validos.length > 0) {
      realm.write(() => {
        let emp = realm.objectForPrimaryKey("Empleado", codigoEmpleado);
        if (!emp) {
          emp = realm.create("Empleado", {
            CodigoEmpleado: codigoEmpleado,
            Nombre: nombre,
            CodigoActividad: codigoActividad,
            CodigoLote: codigoLote,
            CodigoNave: codigoNave,
            CodigoTemporada: "27",
            CodigoAvance: "",
            surcos: []
          });
        }

        validos.forEach(s => emp.surcos.push(s));
      });
    }

    // Mensaje de surcos repetidos
    if (repetidos.length > 0) {
      Alert.alert(
        "Del Campo y Asociados",
        `Los siguientes surcos ya fueron trabajados esta semana y no se pudieron agregar: ${repetidos.join(
          ", "
        )}`
      );
    }

    return { success: true, repetidos };
  } catch (error) {
    console.error("Error en registrarActividadEmpleadoPorSemana:", error);
    return { success: false, error: error.message };
  }
};

export const obtenerEmpleadosXUsuarioYFecha = async (
  codigoTemporada,
  codigoJefe,
  fecha,
  CodigoLote,
  nave,
  cod_tabla
) => {
  const fec = new Date("2026-01-06");
  const response = await fetch(`${API_URL}/empleados-usuario-fecha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      codigoTemporada,
      codigoJefe,
      fec,
      CodigoLote,
      nave,
      cod_tabla
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al obtener los empleados por usuario y fecha"
    );
  }

  return await response.json();
};

export const guardarSurcos = async (listaSurcos, token) => {
  console.log("enviando surcos a guardar:", listaSurcos);

  const response = await fetch(`${API_URL}/surcos/guardar-surcos`, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ listaSurcos })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al guardar los surcos.");
  }
  return await response.json();
};

export const obtenerTrabajo = async (codigoTemporada, codigoJefe, fecha) => {
  //console.log("obteniendo trabajo de los empleados...", codigoTemporada, codigoJefe, fecha);

  const response = await fetch(`${API_URL}/obtener-trabajo`, {
    method: "POST",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify({
      codigoTemporada,
      codigoJefe,
      fecha
    })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al obtener los empleados por usuario y fecha"
    );
  }

  return await response.json();
};

export const guardarJornales = async listaJornales => {
  console.log("Enviando jornales a guardar:", listaJornales);

  const response = await fetch(`${API_URL}/guardar-jornales`, {
    method: "POST",
    headers: {
      "content-Type": "application/json"
    },
    body: JSON.stringify(listaJornales)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al guardar los jornales.");
  }
  return await response.json();
};

export const guardarActividades = async (listaActividades, token) => {
  const response = await fetch(`${API_URL}/Actividades`, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ listaActividades })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al guardar las actividades.");
  }
  return await response.json();
};

//VERIFICACION ACTIVIDADES
export const actualizarPalomitaActividad = async codigoActividad => {
  try {
    const realm = await getRealmInstance();

    // Busca empleados de la actividad
    const empleados = realm
      .objects("Empleado")
      .filtered("CodigoActividad == $0", codigoActividad);

    let tieneSurcos = false;
    for (let emp of empleados) {
      if (emp.surcos && emp.surcos.length > 0) {
        tieneSurcos = true;
        break;
      }
    }

    // Actualiza la actividad
    realm.write(() => {
      const actividad = realm
        .objects("Actividades")
        .filtered("CodigoActividad == $0", codigoActividad)[0];
      if (actividad) {
        actividad.tieneSurcos = tieneSurcos;
      }
    });
  } catch (error) {
    console.error("Error en actualizarPalomitaActividad:", error);
  }
};

export const obtenerEmpleadosXcodigo = async codigoEmpleado => {
  const response = await fetch(`${API_URL}/Obtener-empleado-codigo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ codigoEmpleado })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al obtener los empleados por codigo."
    );
  }

  return await response.json();
};
