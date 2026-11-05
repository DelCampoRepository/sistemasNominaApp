import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ReporteActividadCard({item, parametros}){

    const navigation = useNavigation();
    const [mostrarEmpleados, setMostrarEmpleados] = useState(false);

    function handleOnPress(){
        if(item.NomCortoUnidad ==='SCO')
            navigation.navigate('ListaSurcos', {datosActivdad:item,parametros:parametros})
    }

    // Quitamos duplicados por si el mismo empleado quedara repetido en el periodo.
    const empleadosUnicos = Array.from(
        new Map((item.empleados || []).map(e => [e.id, e])).values()
    );

    return(
        <TouchableOpacity style={styles.cardContainer} activeOpacity={0.8} onPress={handleOnPress}>
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Image source={require("../../../assets/herramientas.png")} style={styles.icon} resizeMode="contain" />
                </View>

                <View style={styles.textos}>
                    <Text style={styles.tituloTexto} numberOfLines={1}>
                        {item.CodigoActividad}-{item.CodigoAvance} · {item.NomCortoUnidad}
                    </Text>
                    <Text style={styles.subtexto} numberOfLines={1}>
                        Lote {item.CodigoLote} · {item.Descripcion}
                    </Text>
                </View>

                {item.NomCortoUnidad === 'SCO' && (
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                )}
            </View>

            <View style={styles.separador} />

            <View style={styles.metricasFila}>
                <View style={styles.metrica}>
                    <Text style={styles.metricaLabel}>Avances</Text>
                    <Text style={styles.metricaValor}>{item.avanceSumado}</Text>
                </View>
                <View style={styles.metrica}>
                    <Text style={styles.metricaLabel}>Jornal</Text>
                    <Text style={styles.metricaValor}>{item.jornales}</Text>
                </View>
                <View style={styles.metrica}>
                    <Text style={styles.metricaLabel}>Empleados</Text>
                    <Text style={styles.metricaValor}>{empleadosUnicos.length}</Text>
                </View>
            </View>

            {empleadosUnicos.length > 0 && (
                <>
                    <TouchableOpacity
                        style={styles.empleadosToggle}
                        activeOpacity={0.7}
                        onPress={() => setMostrarEmpleados(prev => !prev)}
                    >
                        <Ionicons name="people-outline" size={14} color="#2563eb" />
                        <Text style={styles.empleadosToggleTexto}>
                            {mostrarEmpleados ? "Ocultar empleados" : `Ver empleados (${empleadosUnicos.length})`}
                        </Text>
                        <Ionicons name={mostrarEmpleados ? "chevron-up" : "chevron-down"} size={14} color="#2563eb" />
                    </TouchableOpacity>

                    {mostrarEmpleados && (
                        <View style={styles.empleadosLista}>
                            {empleadosUnicos.map((empleado) => (
                                <View key={empleado.id} style={styles.empleadoFila}>
                                    <Ionicons name="person-outline" size={12} color="#9ca3af" />
                                    <Text style={styles.empleadoTexto} numberOfLines={1}>
                                        {empleado.id} - {empleado.nombre}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: "92%",
        marginVertical: 8,
        marginHorizontal: "auto",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 14,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8
    },
    header: {
        flexDirection: "row",
        alignItems: "center"
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#dcfce7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12
    },
    icon: {
        width: "55%",
        height: "55%"
    },
    textos: {
        flex: 1
    },
    tituloTexto: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#111827"
    },
    subtexto: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2
    },
    separador: {
        height: 1,
        backgroundColor: "#f3f4f6",
        marginVertical: 10
    },
    metricasFila: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    metrica: {
        alignItems: "center",
        flex: 1
    },
    metricaLabel: {
        fontSize: 10,
        color: "#9ca3af"
    },
    metricaValor: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginTop: 2
    },
    empleadosToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "#eff6ff"
    },
    empleadosToggleTexto: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2563eb"
    },
    empleadosLista: {
        marginTop: 8,
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10
    },
    empleadoFila: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4
    },
    empleadoTexto: {
        flex: 1,
        fontSize: 12,
        color: "#374151"
    }
})