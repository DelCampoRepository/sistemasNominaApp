import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRealmInstance } from '../realm';



export default function Actividades() {
    const navigation = useNavigation();
    const [naves, setNaves] = useState([]);
    const [realmInstance, setRealmInstance] = useState(null);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const inicializarRealm = async () => {

            setRealmInstance(await getRealmInstance());
        };
        inicializarRealm();
    }, []);



    useEffect(() => {
        const getNaves = async () => {

            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 500);

            const naves = realmInstance.objects('Nave');
            setNaves(naves);
        }
        getNaves();
    }, [realmInstance]);





    const handleNavePress = async (nave) => {
        navigation.navigate('BotonNave', {
            numeroNave: `${nave.CodigoLote} - ${nave.DescripcionLote}`,
            nombreNave: `${nave.CodigoNave} - ${nave.DescripcionNave}`, // para mostrar en la UI
        });


    };



    return (
        <View style={styles.container}>


            {loading ? (<View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#00aa00" style={{ marginTop: 30 }} />
            </View>
            ) : (
                <View style={styles.grid}>
                    {(naves || []).map((nave, index) => (
                        <View key={index} style={styles.cardWrapper}>
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => handleNavePress(nave)}
                            >
                                <View style={styles.iconContainer}>



                                    <Image
                                        source={require('../assets/naves.png')}
                                        style={styles.icon}
                                        resizeMode="contain"
                                    />

                                    {nave.tieneSurcos && (
                                        <Image
                                            source={require('../assets/check...png')} // 👈 Ruta de tu imagen de check
                                            style={styles.checkIcon}
                                        />
                                    )}
                                </View>




                                <View style={styles.textContainer}>
                                    <Text style={styles.loteTexto}>
                                        {nave.CodigoLote} - {nave.DescripcionLote}
                                    </Text>
                                    <Text style={styles.naveTexto}>
                                        {nave.CodigoNave} - {nave.DescripcionNave}
                                    </Text>
                                </View>


                                <View style={styles.card}>
                                    <Text style={styles.loteTexto}>
                                        {nave.CodigoLote} - {nave.DescripcionLote}
                                    </Text>
                                    <Text style={styles.naveTexto}>
                                        {nave.CodigoNave} - {nave.DescripcionNave}
                                    </Text>
                                </View>

                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )
            }
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fff0',
        padding: 18,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%', // columnas  
        marginBottom: 25,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        paddingHorizontal: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        width: '100%',
    },
    iconContainer: {
        backgroundColor: '#E0F7FA',
        borderRadius: 15,
        padding: 19,
    },
    icon: {
        width: 79,
        height: 60,
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loteTexto: {
        fontSize: 12.5,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
        marginBottom: 2,
        marginLeft: 25, // 🔸 Esto lo empuja hacia la derecha
    },
    naveTexto: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
        fontWeight: 'bold'

    },
    loadingOverlay: {
        flex: 1, // 👈 Importante: Esto hace que ocupe todo el espacio vertical disponible
        justifyContent: 'center', // 👈 Centra el contenido (ActivityIndicator) verticalmente
        alignItems: 'center',    // 👈 Centra el contenido horizontalmente
    },
    checkIcon: {
        width: 28.5,
        height: 28.5,
        position: 'absolute',
        top: 6,
        right: 1,
    },

});
