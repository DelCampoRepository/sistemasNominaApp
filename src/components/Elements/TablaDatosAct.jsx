import { View,Text} from "react-native";
import {  useWindowDimensions } from 'react-native';


export default function TablaDatos({datosActividad}){

      const { width } = useWindowDimensions();

    return(<View>
            {Object.keys(datosActividad).length > 0 && (
          <View style={{ marginTop: 20, borderWidth: 1, padding: 10, borderRadius: 5 }}>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Cod. empleado: {datosActividad.codigoEmpleado}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Nom. empleado: {datosActividad.nombreEmpleado}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Lote: {datosActividad.codigoLote}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Nave: {datosActividad.codigoNave}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Tabla: {datosActividad.codigoTabla}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Actividad: {datosActividad.CodigoActividad}-
              {datosActividad.CodigoAvance}, {datosActividad.Descripcion.trim()}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Rend. aplicado: {datosActividad.Rendimiento}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Rend. tope: {datosActividad.RendimientoTope}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Avances: {Number(datosActividad.avances).toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Unidad: {datosActividad.NomCortoUnidad}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Jornal:{" "}
              {(
                Number(datosActividad.jornal) / Number(datosActividad.Rendimiento)
              ).toFixed(2)}
            </Text>
          </View>
        )}
        <Text style={{ fontWeight: "bold", fontSize: width > 600 ? 14 : 13, marginTop: 10 }}>
          Avance
        </Text>
        
    </View>)
}

