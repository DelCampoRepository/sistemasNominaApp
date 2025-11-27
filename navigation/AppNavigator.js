import React, { useState, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Modal,
    Image,
    Alert,
    Animated
} from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import Actividades from '../screens/Actividades';
import ActividadesScreen from '../screens/ActividadesScreen';
import BotonNave from '../screens/BotonNave';
import ReportesScreen from '../screens/ReportesScreen';
import EmpleadosScreen from '../screens/EmpleadosScreen';
import ReportesAct from '../screens/ReportesAct';
import ListaSurcos from '../screens/ListaSurcos';
import ListaEmpleados from '../screens/ListaEmpleados';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
    headerLeftButton: {
        marginLeft: 5,
        padding: 5,
    },
    headerTitleText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    menuContainer: {
        position: 'absolute',
        top: 289,
        right: 35,
        backgroundColor: '#FBFFF7',
        borderRadius: 21,
        elevation: 100,
        padding: 15,
        width: 320,
        height: 197,
    },
    menuItem: {
        flexDirection: 'row',
        paddingVertical: 13,
        paddingHorizontal: 77,
        borderRadius: 10,
        backgroundColor: 'white',
        marginVertical: 5,
        elevation: 5,
        margin: 1,
    },
    menuItemText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 17,
        textAlignVertical: 'center',
        fontWeight: 'bold',
    },
    menuIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        borderColor: 'white',
        borderRadius: 7,
    },
    closeButtonImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        marginLeft: 260,
        marginTop: -3,
        borderRadius: 5,
        margin: 4,
    },
});

function ActividadesHeader() {
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeftButton}>
            <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
    );
}
function ActividadesOptions() {
    const navigation = useNavigation();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    // Animación de rebote de escala
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Abrir modal con rebote + fade
    const openMenu = () => {
        setIsMenuVisible(true);
        Animated.parallel([
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
            ]),
            Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
    };


    const closeMenu = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => setIsMenuVisible(false));

    };


    const navigateToInicio = () => {
        closeMenu();
        navigation.navigate('Home');
    };

    const cerrarSesion = () => {
        closeMenu();
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    onPress: () => navigation.navigate('Login'),
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <View>
            <TouchableOpacity onPress={openMenu}>
                <Ionicons name="ellipsis-vertical" size={28} color="black" />
            </TouchableOpacity>

            <Modal visible={isMenuVisible} transparent={true} onRequestClose={closeMenu}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onPress={closeMenu}
                >
                    <Animated.View style={[styles.menuContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <Image
                            source={require('../assets/cerraar.png')}
                            style={styles.closeButtonImage}
                            resizeMode="contain"
                        />

                        <TouchableOpacity onPress={cerrarSesion} style={styles.menuItem}>
                            <Image source={require('../assets/cerrarsesion.png')} style={styles.menuIcon} />
                            <Text style={styles.menuItemText}>Cerrar sesión</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={navigateToInicio} style={styles.menuItem}>
                            <Image source={require('../assets/inicio.png')} style={styles.menuIcon} />
                            <Text style={styles.menuItemText}>Ir al inicio</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

function CustomBotonNaveHeaderTitle({ route }) {
    const { numeroNave, nombreNave } = route.params;
    return (
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Elegir Tabla De La Nave</Text>
        </View>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', headerShown: false }} />

            <Stack.Screen
                name="Reportes Realizados"
                component={ReportesScreen}
                options={{
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />

            <Stack.Screen
                name="Actividades"
                component={Actividades}
                options={{
                    title: 'Naves',
                    headerShown: true,
                    headerLeft: () => <ActividadesHeader />,
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />

            <Stack.Screen
                name="BotonNave"
                component={BotonNave}
                options={({ route }) => ({
                    headerTitle: () => <CustomBotonNaveHeaderTitle route={route} />,
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                })}
            />

            <Stack.Screen
                name="Reportes"
                component={ReportesScreen}
                options={{
                    headerTitle: 'Reportes',
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />

            <Stack.Screen
                name="ActividadesScreen"
                component={ActividadesScreen}
                options={{
                    headerTitle: 'Actividades',
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />

            <Stack.Screen
                name="Empleados"
                component={EmpleadosScreen}
                options={{
                    headerTitle: 'Empleados',
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />

            <Stack.Screen
                name="ReporteAct"
                component={ReportesAct}
                options={({ route }) => ({
                    headerShown: true,
                    title: route.params?.titulo || 'Reporte por Empleados',
                    headerRight: () => <ActividadesOptions />,
                })}
            />

            <Stack.Screen
                name="ListaSurcos"
                component={ListaSurcos}
                options={{
                    headerShown: true,
                    title: 'Lista de Surcos',
                    headerLeft: () => <ActividadesHeader />,
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />

            <Stack.Screen
                name="ListaEmpleados"
                component={ListaEmpleados}
                options={{
                    headerShown: true,
                    title: 'Lista de Empleados',
                    headerTitleAlign: 'center',
                    headerRight: () => <ActividadesOptions />,
                }}
            />
        </Stack.Navigator>
    );
}
