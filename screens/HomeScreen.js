import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import lista from '../assets/lista.png';
import { useNavigation } from '@react-navigation/native';
import localStorage from '../utils/localStorage';
import reportes from '../assets/reportes.png';
import cargar from '../assets/cargar.png';
import { SurcosContext } from '../Contexts/SurcosContext';

export default function HomeScreen() {


    const navigation = useNavigation();

    const [nombreUsuario, setNombreUsuario] = useState('');



    useEffect(() => {
        cargarNombreUsuario();
    }, []);




    const getUserData = async () => {
        const userData = await localStorage.get("USER_DATA");

        return userData ? JSON.parse(userData) : null;


    };

    const cargarNombreUsuario = async () => {
        const userData = await getUserData();
        if (userData?.Nombre) {

            const nombreFormateado = userData.Nombre
                .toLowerCase()
                .split(' ')
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ');
            setNombreUsuario(nombreFormateado);
        }
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

    return (
        <View style={styles.container}>
            <View style={{ padding: 10 }}>
                <View style={styles.headerContainer}>
                    <View style={styles.tituloContainer}>
                        <Text style={styles.bienvenidoText}>Bienvenido</Text>
                        {nombreUsuario !== '' && (
                            <Text style={styles.nombreUsuarioText}>{nombreUsuario}</Text>
                        )}
                    </View>

                    <View style={styles.logoutContainer}>
                        <TouchableOpacity onPress={confirmarCerrarSesion}>
                            <Image source={require('../assets/cerrars.png')}
                                style={{ width: 38, height: 35 }}
                                resizeMode='contain' />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.logoCenter}>
                    <Image source={require('../assets/logo.png')}
                        style={[styles.logoImage, {
                            elevation: 15,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84
                        }]}
                        resizeMode='contain' />
                </View>
            </View>

            <View style={styles.containerView}>
                <View style={styles.botonesContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Actividades')}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Image source={lista} resizeMode='contain'
                                    style={{ width: 85, height: 85 }} />
                                <Text style={{ color: "grey", fontWeight: "bold", marginTop: 5 }}>
                                    Captura por Actividades
                                </Text>

                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Reportes')}>
                        <View style={styles.cardGrande}>
                            <View style={styles.cardContent}>
                                <Image source={reportes} resizeMode='contain'
                                    style={{ width: 116, height: 98 }} />
                                <Text style={{ color: "grey", fontWeight: "bold", marginTop: 5 }}>
                                    Reportes</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.cardPequeño}>
                        <View style={styles.cardContent}>
                            <Image source={cargar} resizeMode='contain'
                                style={{ width: 100, height: 100 }} />
                            <Text style={{ color: "grey", fontWeight: "bold", marginTop: 5 }}>
                                Sincronizar</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fff0',
        width: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tituloContainer: {
        justifyContent: "space-between",
        flexDirection: "column",
        padding: 10,
        borderRadius: 10,
        margin: 10
    },
    bienvenidoText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: "grey"
    },
    nombreUsuarioText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "grey",
        marginTop: 5
    },
    logoutContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        margin: 15,
        elevation: 5
    },
    logoCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 35,
    },
    logoImage: {
        width: 150,
        height: 150
    },
    containerView: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    botonesContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        alignItems: "center"
    },
    card: {
        width: "76%",
        backgroundColor: 'white',
        padding: 9,
        borderRadius: 20,
        margin: 12,
        elevation: 5,
        marginRight: 5
    },
    cardGrande: {
        width: "90%",
        backgroundColor: 'white',
        padding: 13,
        margin: 12,
        borderRadius: 25,
        marginLeft: 5,
        elevation: 5,
        alignItems: 'center'
    },
    cardPequeño: {
        width: "45%",
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 25,
        marginBottom: 10,
        margin: 10,
        elevation: 5,
        alignItems: 'center'
    },
    cardContent: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});
