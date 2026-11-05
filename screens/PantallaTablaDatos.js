import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  StatusBar,
  Platform,
  Modal,
  Switch,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from "../realm";

const formatearValor = valor => {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
};

const anchoColumna = nombre => Math.max(120, nombre.length * 9 + 40);

const TIPOS_EDITABLES = ["string", "int", "double", "float", "bool", "date"];

const convertirValorEdicion = (texto, propSchema) => {
  const { type, optional } = propSchema;

  if (optional && texto.trim() === "") return null;

  switch (type) {
    case "int":
      return parseInt(texto, 10);
    case "double":
    case "float":
      return parseFloat(texto);
    case "date":
      return new Date(texto);
    default:
      return texto;
  }
};

export default function PantallaTablaDatos() {
  const [realmInstance, setRealmInstance] = useState(null);
  const [modelos, setModelos] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [schemaInfo, setSchemaInfo] = useState({});
  const [primaryKey, setPrimaryKey] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [queryTexto, setQueryTexto] = useState("");
  const [errorQuery, setErrorQuery] = useState(null);
  const [registroEditando, setRegistroEditando] = useState(null);
  const [valoresEdit, setValoresEdit] = useState({});
  const [errorEdit, setErrorEdit] = useState(null);

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (realmInstance) {
        const allModelNames = realmInstance.schema.map(model => model.name);
        setModelos(allModelNames);
      }
    },
    [realmInstance]
  );

  const anchoColumnas = useMemo(
    () => {
      const mapa = {};
      propiedades.forEach(prop => {
        mapa[prop] = anchoColumna(prop);
      });
      return mapa;
    },
    [propiedades]
  );

  const anchoTotal = useMemo(
    () => propiedades.reduce((acc, prop) => acc + anchoColumnas[prop], 0),
    [propiedades, anchoColumnas]
  );

  const correrConsulta = (tabla, filtro) => {
    try {
      const coleccion = filtro
        ? realmInstance.objects(tabla).filtered(filtro)
        : realmInstance.objects(tabla);

      const data = JSON.parse(JSON.stringify(coleccion));
      setRegistros(data);
      setErrorQuery(null);
    } catch (error) {
      setErrorQuery(error.message);
    }
  };

  const seleccionarTabla = modelo => {
    const schema = realmInstance.schema.find(s => s.name === modelo);
    const propsSchema = Object.values(schema.properties);
    const names = propsSchema.map(prop => prop.name);
    const info = {};
    propsSchema.forEach(prop => {
      info[prop.name] = prop;
    });

    setTablaSeleccionada(modelo);
    setPropiedades(names);
    setSchemaInfo(info);
    setPrimaryKey(schema.primaryKey ?? null);
    setQueryTexto("");
    setErrorQuery(null);
    correrConsulta(modelo, null);
  };

  const esEditable = prop =>
    prop !== primaryKey &&
    schemaInfo[prop] &&
    TIPOS_EDITABLES.includes(schemaInfo[prop].type);

  const abrirEdicion = (item, index) => {
    const valoresIniciales = {};
    propiedades.forEach(prop => {
      valoresIniciales[prop] = formatearValor(item[prop]);
    });
    setValoresEdit(valoresIniciales);
    setErrorEdit(null);
    setRegistroEditando({ index });
  };

  const cerrarEdicion = () => {
    setRegistroEditando(null);
    setValoresEdit({});
    setErrorEdit(null);
  };

  const guardarEdicion = () => {
    if (!registroEditando || !tablaSeleccionada) return;

    try {
      const coleccionViva = queryTexto.trim()
        ? realmInstance.objects(tablaSeleccionada).filtered(queryTexto.trim())
        : realmInstance.objects(tablaSeleccionada);

      const objetoReal = coleccionViva[registroEditando.index];

      if (!objetoReal) {
        Alert.alert(
          "Del Campo y Asociados",
          "El registro ya no existe, vuelve a ejecutar la consulta."
        );
        cerrarEdicion();
        return;
      }

      realmInstance.write(() => {
        propiedades.forEach(prop => {
          if (!esEditable(prop)) return;

          const propSchema = schemaInfo[prop];
          objetoReal[prop] =
            propSchema.type === "bool"
              ? valoresEdit[prop] === "true"
              : convertirValorEdicion(valoresEdit[prop] ?? "", propSchema);
        });
      });

      cerrarEdicion();
      correrConsulta(tablaSeleccionada, queryTexto.trim());
    } catch (error) {
      setErrorEdit(error.message);
    }
  };

  const ejecutarQuery = () => {
    if (!tablaSeleccionada) return;
    correrConsulta(tablaSeleccionada, queryTexto.trim());
  };

  const limpiarQuery = () => {
    setQueryTexto("");
    setErrorQuery(null);
    if (tablaSeleccionada) correrConsulta(tablaSeleccionada, null);
  };

  const renderHeaderFila = () =>
    <View style={styles.filaHeader}>
      {propiedades.map(prop =>
        <View key={prop} style={[styles.celdaHeader, { width: anchoColumnas[prop] }]}>
          <Text style={styles.celdaHeaderTexto} numberOfLines={1}>
            {prop}
          </Text>
        </View>
      )}
    </View>;

  const renderFila = ({ item, index }) =>
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => abrirEdicion(item, index)}
      style={[styles.fila, index % 2 === 1 && styles.filaAlterna]}
    >
      {propiedades.map(prop =>
        <View key={prop} style={[styles.celda, { width: anchoColumnas[prop] }]}>
          <Text style={styles.celdaTexto} numberOfLines={1}>
            {formatearValor(item[prop])}
          </Text>
        </View>
      )}
    </TouchableOpacity>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 14 : 14 }]}>
        <Text style={styles.headerTexto}>Explorador de datos</Text>
        <Text style={styles.headerSubtexto}>Consulta las tablas locales (Realm)</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tablasFila}
        contentContainerStyle={styles.tablasContenido}
      >
        {modelos.map(modelo =>
          <TouchableOpacity
            key={modelo}
            activeOpacity={0.8}
            onPress={() => seleccionarTabla(modelo)}
            style={[styles.chip, tablaSeleccionada === modelo && styles.chipActivo]}
          >
            <Ionicons
              name="server-outline"
              size={14}
              color={tablaSeleccionada === modelo ? "white" : "#16a34a"}
            />
            <Text style={[styles.chipTexto, tablaSeleccionada === modelo && styles.chipTextoActivo]}>
              {modelo}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.queryCard}>
        <View style={styles.queryHeaderFila}>
          <Ionicons name="code-slash-outline" size={16} color="#16a34a" />
          <Text style={styles.queryLabel}>
            Consulta{tablaSeleccionada ? ` · ${tablaSeleccionada}` : ""}
          </Text>
        </View>

        <TextInput
          style={styles.queryInput}
          placeholder={
            tablaSeleccionada
              ? 'ej: CodigoEmpleado == "123"'
              : "Selecciona una tabla para consultar"
          }
          placeholderTextColor="#9ca3af"
          multiline
          editable={!!tablaSeleccionada}
          value={queryTexto}
          onChangeText={setQueryTexto}
        />

        {errorQuery &&
          <Text style={styles.queryError} numberOfLines={2}>
            {errorQuery}
          </Text>}

        <View style={styles.queryBotonesFila}>
          <TouchableOpacity
            style={[styles.queryBoton, styles.queryBotonLimpiar]}
            onPress={limpiarQuery}
            disabled={!tablaSeleccionada}
          >
            <Text style={styles.queryBotonLimpiarTexto}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.queryBoton,
              styles.queryBotonEjecutar,
              !tablaSeleccionada && styles.queryBotonDeshabilitado
            ]}
            onPress={ejecutarQuery}
            disabled={!tablaSeleccionada}
          >
            <Ionicons name="play" size={14} color="white" />
            <Text style={styles.queryBotonEjecutarTexto}>Ejecutar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.queryAyuda}>
          Realm no usa SQL: el filtro usa la sintaxis RQL de Realm (similar a NSPredicate), ej: Nombre CONTAINS[c] "ana"
        </Text>
      </View>

      <View style={styles.resultadosCard}>
        <View style={styles.resultadosHeaderFila}>
          <Text style={styles.resultadosTitulo}>Resultados</Text>
          <Text style={styles.resultadosContador}>
            {registros.length} fila{registros.length === 1 ? "" : "s"}
          </Text>
        </View>

        {!tablaSeleccionada
          ? <View style={styles.vacio}>
              <Ionicons name="grid-outline" size={30} color="#9ca3af" />
              <Text style={styles.vacioTexto}>Selecciona una tabla arriba para ver sus datos</Text>
            </View>
          : <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
              <View style={{ width: Math.max(anchoTotal, 1), flex: 1 }}>
                <FlatList
                  data={registros}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={renderFila}
                  ListHeaderComponent={renderHeaderFila}
                  stickyHeaderIndices={[0]}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  updateCellsBatchingPeriod={50}
                  windowSize={10}
                  removeClippedSubviews
                  style={{ flex: 1 }}
                  ListEmptyComponent={
                    <View style={styles.vacio}>
                      <Text style={styles.vacioTexto}>Sin resultados para esta consulta</Text>
                    </View>
                  }
                />
              </View>
            </ScrollView>}
      </View>

      <Modal
        visible={!!registroEditando}
        transparent
        animationType="fade"
        onRequestClose={cerrarEdicion}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <TouchableOpacity style={styles.cerrarIcono} onPress={cerrarEdicion}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.modalIconCircle}>
              <Ionicons name="create-outline" size={22} color="#16a34a" />
            </View>
            <Text style={styles.modalTitulo}>Editar registro</Text>
            <Text style={styles.modalSubtitulo}>{tablaSeleccionada}</Text>

            <ScrollView style={styles.modalCampos} showsVerticalScrollIndicator>
              {propiedades.map(prop => {
                const propSchema = schemaInfo[prop];
                const editable = esEditable(prop);

                return (
                  <View key={prop} style={styles.campoFila}>
                    <View style={styles.campoLabelFila}>
                      {!editable && <Ionicons name="lock-closed" size={11} color="#9ca3af" />}
                      <Text style={styles.campoLabel} numberOfLines={1}>
                        {prop}
                      </Text>
                    </View>

                    {!editable
                      ? <Text style={styles.campoValorSoloLectura} numberOfLines={1}>
                          {valoresEdit[prop]}
                        </Text>
                      : propSchema.type === "bool"
                        ? <Switch
                            value={valoresEdit[prop] === "true"}
                            onValueChange={valor =>
                              setValoresEdit(prev => ({ ...prev, [prop]: valor ? "true" : "false" }))
                            }
                            trackColor={{ false: "#e5e7eb", true: "#bbf7d0" }}
                            thumbColor={valoresEdit[prop] === "true" ? "#16a34a" : "#f4f3f4"}
                          />
                        : <TextInput
                            style={styles.campoInput}
                            value={valoresEdit[prop]}
                            onChangeText={texto =>
                              setValoresEdit(prev => ({ ...prev, [prop]: texto }))
                            }
                            keyboardType={
                              ["int", "double", "float"].includes(propSchema.type)
                                ? "numeric"
                                : "default"
                            }
                            placeholder={propSchema.type === "date" ? "ISO 8601" : ""}
                            placeholderTextColor="#9ca3af"
                          />}
                  </View>
                );
              })}
            </ScrollView>

            {errorEdit &&
              <Text style={styles.queryError} numberOfLines={2}>
                {errorEdit}
              </Text>}

            <View style={styles.modalBotonesFila}>
              <TouchableOpacity
                style={[styles.queryBoton, styles.queryBotonLimpiar]}
                onPress={cerrarEdicion}
              >
                <Text style={styles.queryBotonLimpiarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.queryBoton, styles.queryBotonEjecutar]}
                onPress={guardarEdicion}
              >
                <Ionicons name="checkmark" size={14} color="white" />
                <Text style={styles.queryBotonEjecutarTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fff0"
  },
  header: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 22,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerTexto: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },
  headerSubtexto: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2
  },
  tablasFila: {
    flexGrow: 0,
    marginTop: 12
  },
  tablasContenido: {
    paddingHorizontal: 16,
    gap: 8
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginRight: 8
  },
  chipActivo: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a"
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a"
  },
  chipTextoActivo: {
    color: "white"
  },
  queryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  queryHeaderFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8
  },
  queryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151"
  },
  queryInput: {
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    maxHeight: 90,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    textAlignVertical: "top"
  },
  queryError: {
    color: "#dc2626",
    fontSize: 11,
    marginTop: 6
  },
  queryBotonesFila: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10
  },
  queryBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  queryBotonLimpiar: {
    backgroundColor: "#f3f4f6"
  },
  queryBotonLimpiarTexto: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 12
  },
  queryBotonEjecutar: {
    backgroundColor: "#16a34a"
  },
  queryBotonDeshabilitado: {
    opacity: 0.5
  },
  queryBotonEjecutarTexto: {
    color: "white",
    fontWeight: "700",
    fontSize: 12
  },
  queryAyuda: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 8
  },
  resultadosCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: "hidden"
  },
  resultadosHeaderFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  resultadosTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827"
  },
  resultadosContador: {
    fontSize: 11,
    color: "#6b7280"
  },
  vacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8
  },
  vacioTexto: {
    fontSize: 12,
    color: "#9ca3af"
  },
  filaHeader: {
    flexDirection: "row",
    backgroundColor: "#111827"
  },
  celdaHeader: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#1f2937"
  },
  celdaHeaderTexto: {
    color: "#f9fafb",
    fontSize: 11,
    fontWeight: "700"
  },
  fila: {
    flexDirection: "row",
    backgroundColor: "#ffffff"
  },
  filaAlterna: {
    backgroundColor: "#f8fafc"
  },
  celda: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  celdaTexto: {
    fontSize: 11,
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },
  modalContenido: {
    backgroundColor: "white",
    borderRadius: 24,
    maxHeight: "80%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 18,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  cerrarIcono: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  modalTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827"
  },
  modalSubtitulo: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    marginBottom: 12
  },
  modalCampos: {
    width: "100%"
  },
  campoFila: {
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  campoLabelFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4
  },
  campoLabel: {
    fontSize: 10,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  campoValorSoloLectura: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic"
  },
  campoInput: {
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  modalBotonesFila: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
    width: "100%"
  }
});
