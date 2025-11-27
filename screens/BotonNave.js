import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import localStorage from '../utils/localStorage';
import { getRealmInstance } from '../realm';
import { SurcosContext } from '../Contexts/SurcosContext';



const BotonNave = () => {

    const { codigoLote, setNave, nave, setCodigoTabla } = useContext(SurcosContext);
    const route = useRoute();
    const navigation = useNavigation();

    const [tablaNorte, setTablaNorte] = useState(false)
    const [tablaSur, setTablaSur] = useState(false)
    const [tablas, setTablas] = React.useState([]);
    const [loading, setLoading] = useState(false)


    const [naveSeleccionada, setNaveSeleccionada] = useState(numeroNave);
    const [listaTablas, setListaTablas] = useState([])

    const { numeroNave, nombreNave } = route.params || {};
    const [realmInstance, setRealmInstance] = useState(null);


    useEffect(() => {
        const inicializarRealm = async () => {

            setRealmInstance(await getRealmInstance());
        };
        inicializarRealm();
    }, []);






    const obtenerTablasPorNave = async (numeroNave, nombreNave) => {
        try {
            if (!realmInstance) return { norte: [], sur: [] }; // si aún no cargó

            // Extraer los valores de los parámetros recibidos
            const codigoLote = parseInt(numeroNave.split(' - ')[0]);
            const codigoNave = nombreNave.split(' - ')[0]; // "E2 - Nave A" => "E2"

            const tablas = realmInstance.objects('Tablas').filtered(
                'CodigoLote == $0 AND CodigoNave == $1',
                codigoLote,
                codigoNave
            );

            if (tablas.length === 0) {
                console.log(`No se encontraron tablas para la nave ${numeroNave}`);
                return { norte: [], sur: [] };
            }

            // Separar Norte y Sur
            const tablaNorte = tablas.filtered("Descripcion CONTAINS[c] 'NORTE'");
            const tablaSur = tablas.filtered("Descripcion CONTAINS[c] 'SUR'");

            // console.log('Tablas filtradas Norte:', tablaNorte);
            //console.log('Tablas filtradas Sur:', tablaSur);

            return { norte: tablaNorte, sur: tablaSur };


        } catch (error) {
            console.error('Error al obtener tablas de Realm:', error);
            return { norte: [], sur: [] };
        }
    };


    useEffect(() => {
        const cargarTablas = async () => {
            if (!numeroNave || !nombreNave || !realmInstance) return;

            const resultado = await obtenerTablasPorNave(numeroNave, nombreNave);

            const listas = [];

            resultado.norte.forEach(tabla => {
                listas.push({ descripcion: tabla.Descripcion, codigoTabla: tabla.CodigoTabla, CodigoLote: tabla.CodigoLote });
            });

            resultado.sur.forEach(tabla => {
                listas.push({ descripcion: tabla.Descripcion, codigoTabla: tabla.CodigoTabla, CodigoLote: tabla.CodigoLote });
            });


            setListaTablas(listas);
        };

        cargarTablas();
    }, [numeroNave, nombreNave, realmInstance]);





    useFocusEffect(
        React.useCallback(() => {

            async function estadosSurcos() {
                await verificacionTabla('NORTE')
                await verificacionTabla('SUR')

            }
            estadosSurcos();
        }, [])
    );




    useEffect(() => {
        setNave(nombreNave.substring(0, 2));
    }, [nombreNave]);




    const getUserData = async () => {
        const userData = await localStorage.get("USER_DATA");
        return userData ? JSON.parse(userData) : null;
    };




    const verificacionTabla = async (tablaLabel) => {
        try {
            const realm = await getRealmInstance();
            const tablaRealm = realm.objects("Tablas").filtered(' Descripcion == $0', tablaLabel);


            if (tablaRealm.length > 0) {
                const estado = Boolean(tablaRealm[0].tieneSurcos);

                if (tablaLabel === 'NORTE') {
                    setTablaNorte(estado);
                } else if (tablaLabel === 'SUR') {
                    setTablaSur(estado);
                }
            }
        } catch (error) {
            console.error(`[ERROR] Falló la verificación para ${tablaLabel}:`, error);
        }
    };






    const renderItem = ({ item }) => (
        <TouchableOpacity
            key={item.codigoTabla}
            style={styles.tablaCard}
            onPress={() => {
                setCodigoTabla(item.codigoTabla)

                navigation.navigate('ActividadesScreen', {
                    numeroNave,
                    nombreNave,
                    codigoLote: item.CodigoLote, // o CodigoTabla
                    descripcionTabla: item.descripcion,
                });

            }
            }
        >
            <View style={styles.tablaIconContainer}>
                <Image
                    source={require('../assets/plantas.png')}
                    style={styles.tablaIcon}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.tablaText}>{item.descripcion}</Text>
        </TouchableOpacity>
    );

    return (

        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00aa00" />
                </View>

            ) : (
                <>

                    {/* Encabezado */}
                    <View style={styles.headerContainer}>
                        <View style={styles.subcontainer}>
                            <Text style={[styles.headerDetailText, styles.sharedoption]}>
                                {numeroNave}  {nombreNave}


                            </Text>
                        </View>
                    </View>

                    <FlatList
                        data={listaTablas}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        horizontal
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        showsHorizontalScrollIndicator={false}
                    />



                </>
            )}
        </View>

    );
};






const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fff0',
        paddingTop: 17,
        width: '100%',
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tarjeta/botón de tabla
    tablaCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 28,
        paddingHorizontal: 45,
        marginHorizontal: 12,
        margin: 7,
        justifyContent: 'center',
        elevation: 7,
        height: 130,
        width: 158

    },


    tablaIcon: {
        width: 60,
        height: 65,
    },

    // Texto de la tabla
    tablaText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        padding: 7
    },

    headerContainer: {
        backgroundColor: '#B3E0B3',
        paddingTop: 17,
        paddingBottom: 16,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center'
    },
    subcontainer: {
        paddingTop: 12,
        paddingBottom: 8,
    },
    headerDetailText: {
        fontSize: 13.5,
        color: '#333',
        fontWeight: 'bold',
    },
    sharedoption: {
        paddingBottom: 1,
    },

});


export default BotonNave;