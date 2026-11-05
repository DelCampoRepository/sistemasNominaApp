import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
    StatusBar,
    Platform,
    useWindowDimensions
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from '../realm';
import reportes from '../assets/reportes.png';
import cargar from '../assets/cargar.png';
import porEmpleado from '../assets/inmigracion.png';

export default function HomeScreen() {

    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [realmInstance, setRealmInstance] = useState(null);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [estadoSinc, setEstadoSinc] = useState(false);

    useEffect(() => {
        const inicializarRealm = async () => {
            setRealmInstance(await getRealmInstance());
        };
        inicializarRealm();
    }, []);

    useEffect(() => {
        if (realmInstance != null) {
            cargarNombreUsuario();
        }
    }, [realmInstance]);

    useFocusEffect(
        useCallback(() => {
            try {
                if (realmInstance != null) {
                    const sync = realmInstance.objectForPrimaryKey("Sincronizar", 0);
                    const estaSincronizado = sync?.sincronizado ?? false;
                    setEstadoSinc(estaSincronizado);
                }
            } catch (error) {
                // sin registro de sincronizacion aun
            }
        }, [realmInstance])
    );

    const getUserData = async () => {
        if (realmInstance == null) return null;
        const result = realmInstance.objects("UserData")[0];
        return result;
    };

    const handleSincronizar = () => {
        navigation.navigate("Loading");
    };

    const cargarNombreUsuario = async () => {
        const userData = await getUserData();

        if (userData?.nombre) {
            const nombreFormateado = userData.nombre
                .toLowerCase()
                .split(' ')
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ');
            setNombreUsuario(nombreFormateado);
        }
    };

    const GenerarFecha = () => {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        return `${dia}/${mes}/${año}`;
    };

    const confirmarCerrarSesion = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    onPress: () => {
                        navigation.navigate('Login');
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    const acciones = [
        {
            key: 'empleado',
            label: 'Act. por empleado',
            icon: porEmpleado,
            iconBg: '#e0f2fe',
            onPress: () => navigation.navigate('ListaEmpleados')
        },
        {
            key: 'reportes',
            label: 'Reportes',
            icon: reportes,
            iconBg: '#fef3c7',
            onPress: () => navigation.navigate('Reportes')
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

            <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 18 : 18 }]}>
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerSaludo}>
                            Hola{nombreUsuario !== '' ? `, ${nombreUsuario.split(' ')[0]}` : ''}
                        </Text>
                        <Text style={styles.headerFecha}>{GenerarFecha()}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => navigation.navigate('Configuracion')}
                    >
                        <Ionicons name="settings-outline" size={22} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconBtn, { marginLeft: 10 }]}
                        onPress={confirmarCerrarSesion}
                    >
                        <Ionicons name="log-out-outline" size={22} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.seccionTitulo}>Accesos rápidos</Text>

                <View style={styles.grid}>
                    {acciones.map(accion => (
                        <TouchableOpacity
                            key={accion.key}
                            style={[styles.card, { width: width > 600 ? '31%' : '47%' }]}
                            activeOpacity={0.85}
                            onPress={accion.onPress}
                        >
                            <View style={[styles.cardIconCircle, { backgroundColor: accion.iconBg }]}>
                                <Image source={accion.icon} resizeMode="contain" style={styles.cardIcon} />
                            </View>
                            <Text style={styles.cardLabel}>{accion.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.syncCard}
                    activeOpacity={0.85}
                    onPress={handleSincronizar}
                >
                    <View style={styles.syncIconCircle}>
                        <Image source={cargar} resizeMode="contain" style={styles.syncIcon} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.syncLabel}>Sincronizar</Text>
                        <View style={styles.syncEstadoFila}>
                            <View style={[styles.syncDot, { backgroundColor: estadoSinc ? '#16a34a' : '#f59e0b' }]} />
                            <Text style={styles.syncEstadoTexto}>
                                {estadoSinc ? 'Sincronizado' : 'Pendiente por sincronizar'}
                            </Text>
                        </View>
                    </View>

                    <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0fff0',
    },
    header: {
        backgroundColor: '#16a34a',
        paddingHorizontal: 22,
        paddingBottom: 26,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerSaludo: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerFecha: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        marginTop: 4,
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    seccionTitulo: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 14,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 14,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 14,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    cardIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardIcon: {
        width: 36,
        height: 36,
    },
    cardLabel: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
    },
    syncCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        marginTop: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    syncIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncIcon: {
        width: 32,
        height: 32,
    },
    syncLabel: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 15,
    },
    syncEstadoFila: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    syncDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    syncEstadoTexto: {
        color: '#6b7280',
        fontSize: 12,
    },
});
