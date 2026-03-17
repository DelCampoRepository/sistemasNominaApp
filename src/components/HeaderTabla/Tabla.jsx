import { View, ScrollView } from "react-native";
import HeaderTab from "./Header";
import RowTabla from "./Row";
import React, { useEffect, useState } from "react";
import { getRealmInstance } from "../../../realm";
import { index } from "realm";

export default function Tabla() {
  const [realmInstace, setRealmInstance] = useState(null);
  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };

    inicializarRealm();
  }, []);

  useEffect(() => {
    if (!realmInstace) return;

    const setupRealmListener = async () => {
      try {
        const registros = realmInstace.objects("SurcoDecimal");

        const listener = () => {
          setRegistros(registros);
        };

        registros.addListener(listener);

        return () => {
          if (!registros.isValid()) return;
          registros.removeListener(listener);
        };
      } catch (error) {
        console.error("Error al configurar el listener de Realm:", error);
      }
    };
    setupRealmListener();
  }, [realmInstace]);

  return (
    <ScrollView horizontal>
      <View>
        <HeaderTab />
        <ScrollView>
          <View style={{ flex: 1, flexDirection: "column" }}>
            {registros.length > 0 &&
              registros.map((registro) => (
                <RowTabla
                  key={`
          ${registro.surco}-
          ${registro.tabla}-
          ${registro.nave}-
          ${registro.lote}-
          ${registro.actividad}-
          ${registro.avance}-
          ${registro.codEmpleado}-
          ${registro.fecha}-
          ${registro.semanaActiva}-
           ${registro.nombreEmpleado}-
            ${registro.descripcionAct}-
            ${registro.avanceAcum}`} // Key más limpia
                  surco={registro.surco}
                  tabla={registro.tabla}
                  nave={registro.nave}
                  lote={registro.lote}
                  actividad={registro.actividad}
                  avance={registro.avance}
                  codEmpleado={registro.codEmpleado}
                  avanceAcum={registro.avanceAcum}
                  nombreEmpleado={registro.nombreEmpleado}
                  descripcion={String(registro.descripcionAct).trim()}
                  semanaActiva={registro.semanaActiva}
                  fecha={String(registro.fecha).slice(0, 10)}
                />
              ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}
/**
 *  <HeaderTab />
        {registros.length > 0 &&
          registros.map((registro) => <RowTabla key={registro._id} />)}
 */
/**
 *   surco={registro.surco}
                tabla={registro.tabla}
                nave={registro.nave}
                lote={registro.lote}
                actividad={registro.actividad}
                avance={registro.avance}
                codEmpleado={registro.codEmpleado}
                avanceAcum={registro.avanceAcum}
                nombreEmpleado={registro.nombreEmpleado}
                descripcion={String(registro.descripcionAct).trim()}
                fecha={String(registro.fecha)}
                semanaActiva={registro.semanaActiva}
 */
