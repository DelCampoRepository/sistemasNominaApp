import React, { useState, useEffect, useContext, } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropdownComponent from '../components/Dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import calendario from "../assets/calendario.png";
import agricultor from '../assets/agricultor.png';
import proteccion from '../assets/proteccion.png';
import * as services from '../services/services';
import { SurcosContext } from '../Contexts/SurcosContext';

import { getRealmInstance } from '../realm';


const ReportesScreen = () => {
    const navegacion = useNavigation();

    const [loadingActividades, setLoadingActividades] = useState(false);
    const [loadingEmpleados, setLoadingEmpleados] = useState(false)


    const [navesRealm, setNavesRealm] = useState([]);
    const [tablasRealm, setTablasRealm] = useState([]);

    const [naveSeleccionada, setNaveSeleccionada] = useState(null);
    const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
    const [tablasFiltradas, setTablasFiltradas] = useState([]);


    const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
    const [fechaInicio, setFechaInicio] = useState(null);
    const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
    const [fechaFin, setFechaFin] = useState(null);

    const [listaSurcosActividades, setListaSurcosActividades] = useState([]);


    const [listaEmpleados, setListaEmpleados] = useState([]);
    const { CodigoTemporada } = useContext(SurcosContext);

    // const [opcion, setOpcion] = useState(0)


    const [listaReporteAct, setlistaReporteAct] = useState([
        {
            opcion: "",
            codigoLote: "",
            codigoNave: "",
            codigoTabla: "",
            codigoTemporada: "",
            codigoActividad: "",
            descripcion: "",
            codigoAvance: "",
            cantidadSurcos: "",
            descripcionLote: "",
            descripcionNave: "",
            tablaLabel: "",
            fechaInicio: "",
            fechaFin: "",
            codigoJefeNave: "",
            codigoEmpleado: "",
            nombre: ""

        }, {
            opcion: "",
            codigoLote: "",
            codigoNave: "",
            codigoTabla: "",
            codigoTemporada: "",
            codigoActividad: "",
            descripcion: "",
            codigoAvance: "",
            cantidadSurcos: "",
            descripcionLote: "",
            descripcionNave: "",
            tablaLabel: "",
            fechaInicio: "",
            fechaFin: "",
            codigoJefeNave: "",
            codigoEmpleado: "",
            nombre: ""




        }])

    const listaReporteEmpleados = [

        {
            codigoEmpleado: '01357',
            Nombre: 'Dafne',
            ApellidoP: 'Gaxiola',
            ApellidoM: 'González',

            CantidadActividades: '2'
        },
        {
            codigoEmpleado: '01308',
            Nombre: 'Dacia Margarita',
            ApellidoP: 'González',
            ApellidoM: 'Elizalde',


            CantidadActividades: '4'
        },

        {
            codigoEmpleado: '000123',
            Nombre: 'Luis Fernando',
            ApellidoP: 'González',
            ApellidoM: 'Garcia',

            CantidadActividades: '2'
        },

        {
            codigoEmpleado: '000022',
            Nombre: 'Janithzia Elizabeth',
            ApellidoP: 'Castillo',
            ApellidoM: 'Bustamante',

            CantidadActividades: '3'
        },

        {
            codigoEmpleado: '000023',
            Nombre: 'Raúl',
            ApellidoP: 'Armienta',
            ApellidoM: 'Mendoza',

            CantidadActividades: '5'
        },




    ]


    // console.log(fechaFin, 'feee')
    useEffect(() => {
        const cargarNavesDesdeRealm = async () => {
            try {
                const realm = await getRealmInstance();
                const naves = realm.objects('Nave');

                //  console.log("Naves Obtenidas de Realm:", naves);

                const opcionesNaves = naves.map(nave => ({
                    label: `${nave.CodigoNave} - ${nave.DescripcionNave || 'Sin Descripción'}`,
                    value: nave.CodigoNave,
                }));
                setNavesRealm(opcionesNaves);

            } catch (error) {
                console.error("Error al cargar naves desde Realm:", error);
                Alert.alert("Del Campo y Asociados", "No se pudieron cargar las naves.");
            }
        };

        cargarNavesDesdeRealm();
    }, []);

    useEffect(() => {
        const cargarTablasDesdeRealm = async () => {
            try {
                const realm = await getRealmInstance();
                const tablas = realm.objects('Tablas');

                // console.log("Tablas Obtenidas de Realm:", tablas);

                const opcionesTablas = tablas.map(tabla => ({
                    label: `${tabla.CodigoTabla} - ${tabla.Descripcion || 'Sin Descripción'}`,
                    value: String(tabla.CodigoTabla),
                    naveRelacionada: String(tabla.CodigoNave),
                }));
                setTablasRealm(opcionesTablas);

            } catch (error) {
                console.error("Error al cargar tablas desde Realm:", error);
                Alert.alert("Del Campo y Asociados", "No se pudieron cargar las tablas.");
            }
        };

        cargarTablasDesdeRealm();
    }, []);

    useEffect(() => {
        if (naveSeleccionada) {
            const filtradas = tablasRealm.filter(tabla => tabla.naveRelacionada === naveSeleccionada);
            setTablasFiltradas(filtradas);
            setTablaSeleccionada(null);
        } else {
            setTablasFiltradas([]);
            setTablaSeleccionada(null);
        }
    }, [naveSeleccionada, tablasRealm]);



    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const day = String(fecha.getDate()).padStart(2, '0');
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const year = fecha.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatearFecha2 = (fecha) => {
        if (!fecha) return "";
        const day = String(fecha.getDate()).padStart(2, '0');
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const year = fecha.getFullYear();
        return `${year}/${month}/${day}`;
    };


    // Función para manejar el reporte por Actividades
    const manejarReporteActividades = async () => {
        const OPCION_ACT = 1;
        try {
            if (!naveSeleccionada || !tablaSeleccionada) {
                Alert.alert("Del Campo y Asociados", "Seleccione nave y tabla.");
                return;
            }
            if (!fechaInicio || !fechaFin) {
                Alert.alert("Del Campo y Asociados", "Seleccione las fechas de inicio y fin para el reporte.");
                return;
            }

            if (fechaInicio > fechaFin) {
                Alert.alert("Del Campo y Asociados", "La fecha inicial no puede ser posterior a la final.");
                return;
            }

            //    setOpcion(1)
            setLoadingActividades(true)



            const params = {
                codigoNave: naveSeleccionada,
                codigoTabla: tablaSeleccionada,
                codigoTemporada: CodigoTemporada,
                fechaInicio: fechaInicio.toISOString().split("T")[0],
                fechaFin: fechaFin.toISOString().split("T")[0],

            };




            const datosExtras = await cargarReportesAct(params);


            if (!datosExtras || !datosExtras.datos || datosExtras.datos.length === 0) {
                Alert.alert("Información", "No hay datos disponibles para el rango de fechas seleccionado.");
                return;
            }


            const { codigoLote, codigoJefeNave } = datosExtras;

            const labelNave = navesRealm.find(n => n.value === naveSeleccionada)?.label || naveSeleccionada;
            const labelTabla = tablasRealm.find(t => t.value === tablaSeleccionada)?.label || tablaSeleccionada;
            //console.log(datosExtras.datos, 'hayyyy')



            if (datosExtras.datos) {

                navegacion.navigate("ReporteAct", {
                    titulo: "Reporte Por Actividades",
                    opcion: OPCION_ACT,
                    descripcionLote: `LOTE ${codigoLote}`,
                    descripcionNave: labelNave,
                    tablaLabel: labelTabla,
                    fechaInicio: formatearFecha(fechaInicio),
                    fechaFin: formatearFecha(fechaFin),
                    codigoNave: naveSeleccionada,
                    codigoTabla: tablaSeleccionada,
                    codigoLote,
                    codigoJefeNave,
                    listaSurcosActividades: datosExtras.datos,
                });

            }
        } catch (error) {
            console.error("Error al manejar reporte de actividades:", error);
            Alert.alert("Error", "Ocurrió un error al cargar el reporte.");
        } finally {
            setLoadingActividades(false);
        }

    };

    //console.log(listaSurcosActividades, " listado");

    const cargarReportesAct = async (userData) => {

        setLoadingActividades(true);
        try {
            if (!userData) {
                console.warn(" userData es undefined");
                return null;
            }

            const { codigoNave, codigoTabla, fechaInicio, fechaFin } = userData;
            const realm = await getRealmInstance();
            const codigoTemporada = CodigoTemporada;

            const tablas = realm.objects('Tablas').filtered(`CodigoNave == "${codigoNave}" && CodigoTabla == ${codigoTabla}`);
            if (!tablas || tablas.length === 0) {
                console.warn("No se encontró información de la tabla.");
                return null;
            }

            const codigoLote = tablas[0].CodigoLote.toString();
            const jefeNave = tablas[0].CodigoJefeNave;

            const parametros = {
                opcion: 1,
                codigoLote,
                codigoNave,
                codigoTemporada,
                fechaInicio,
                fechaFin,
                codigoEmpleado: null,
                codigoJefeNave: jefeNave,
                codigoTabla: parseInt(codigoTabla),
            };



            //      console.log("Parámetros enviados al backend:", parametros);


            const response = await services.obtenerReporteActividades(parametros);



            //  console.log("Respuesta del backend222222:", response.datos);
            if (!response.datos || response.datos.length === 0) {
                console.warn("No se recibió información del backend.");
                return null;
            }

            //    setListaSurcosActividades(response.datos);


            //  console.log("Lista de Surcos Actividades:", listaSurcosActividades);
            realm.write(() => {
                realm.delete(realm.objects('ReportesAct'));
                response.datos.forEach((item) => {
                    realm.create('ReportesAct', {
                        CodigoActividad: item.CodigoActividad,
                        CodigoAvance: item.CodigoAvance,
                        Descripcion: item.Descripcion,
                        CantidadSurcos: item.CantidadSurcos,
                        fecha: formatearFecha2,
                    }, "modified");
                });
            });

            return {
                codigoLote,
                codigoJefeNave: jefeNave,
                datos: response.datos,
            };

        } catch (error) {
            console.error("Error en cargarReportesAct:", error.message);
            return null;
        } finally {
            setLoadingActividades(false);
        }
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Función para manejar el reporte por Empleados
    const manejarReporteEmpleados = async () => {
        setLoadingEmpleados(true);
        const OPCION_EMP = 2
        try {
            if (!naveSeleccionada || !tablaSeleccionada) {
                Alert.alert("Del Campo y Asociados", "Seleccione nave y tabla.");
                return;
            }

            if (!fechaInicio || !fechaFin) {
                Alert.alert("Del Campo y Asociados", "Seleccione las fechas de inicio y fin para el reporte.");
                return;
            }

            if (fechaInicio > fechaFin) {
                Alert.alert("Del Campo y Asociados", "La fecha inicial no puede ser posterior a la final.");
                return;
            }

            // setOpcion(2)

            const params = {
                codigoNave: naveSeleccionada,
                codigoTabla: tablaSeleccionada,
                fechaInicio: fechaInicio.toISOString().split("T")[0],
                fechaFin: fechaFin.toISOString().split("T")[0],
            };


            //  console.log(params)
            const datosExtras = await cargarReportesEmp(params);
            /*  if (!datosExtras) {
                  Alert.alert("Error", "No se pudo cargar el reporte.");
                  return;
              }*/


            const { codigoLote, codigoJefeNave } = datosExtras;

            const labelNave = navesRealm.find(n => n.value === naveSeleccionada)?.label || naveSeleccionada;
            const labelTabla = tablasRealm.find(t => t.value === tablaSeleccionada)?.label || tablaSeleccionada;


            //7console.log(listaEmpleados, 'frgdfra')
            if (datosExtras?.datos && datosExtras.datos.length > 0) {

                navegacion.navigate("ListaEmpleados", {
                    opcion: OPCION_EMP,
                    titulo: "Reporte Por Empleados",
                    listaReporteEmpleados: datosExtras.datos,
                    descripcionLote: `LOTE ${codigoLote}`,
                    descripcionNave: labelNave,
                    tablaLabel: labelTabla,
                    fechaInicio: formatearFecha(fechaInicio),
                    fechaFin: formatearFecha(fechaFin),
                    codigoNave: naveSeleccionada,
                    codigoTabla: tablaSeleccionada,
                    codigoLote,
                    codigoJefeNave,

                });
            }
        } catch (error) {
            console.error("Error al manejar reporte de empleados:", error);
            Alert.alert("Error", "Ocurrió un error al cargar el reporte.");
        } finally {
            setLoadingEmpleados(false);
        }
    };


    const cargarReportesEmp = async (userData) => {
        setLoadingEmpleados(true)
        try {

            if (!userData) {
                console.warn("userData es undefined");
                return null;
            }


            const { codigoNave, codigoTabla, fechaInicio, fechaFin } = userData;

            const realm = await getRealmInstance();

            const codigoTemporada = CodigoTemporada;


            const tablas = realm.objects('Tablas').filtered(`CodigoNave == "${codigoNave}" && CodigoTabla == ${codigoTabla}`);

            if (!tablas || tablas.length === 0) {
                console.warn("No se encontró información de la tabla.");
                return null;
            }

            const codigoLote = tablas[0].CodigoLote.toString();
            const jefeNave = tablas[0].CodigoJefeNave;

            const parametros = {
                codigoLote,
                codigoNave,
                codigoTemporada,
                fechaInicio,
                fechaFin,
                codigoJefeNave: jefeNave,
                codigoTabla: parseInt(codigoTabla),
            };
            //console.log(parametros, "dwqdw")

            //   console.log(" enviados:", parametros);

            const response = await services.obtenerReporteEmpleados(parametros);
            const empleados = response.datos || [];

            if (!response.datos || response.datos.length === 0) {
                //console.warn("No se recibió información del backend.");
                // return null;
            }
            //  console.log(response.datos, "dedwa")


            setListaEmpleados(response.datos);
            //console.log(listaEmpleados, "edwas")
            //  setListaEmpleados(listaReporteEmpleados)
            realm.write(() => {
                realm.delete(realm.objects('ReporteEmpleados'));
                empleados.forEach((item) => {
                    realm.create('ReporteEmpleados', {
                        CodigoEmpleado: item.CodigoEmpleado,
                        Nombre: item.Nombre,
                        CantidadActividades: String(item.CantidadActividades),
                    }, "modified");
                });
            });

            setListaEmpleados(empleados);



            return {
                codigoLote,
                codigoJefeNave: jefeNave,
                datos: empleados,
            };

        } catch (error) {
            console.error("Error en cargarReportesEmp:", error.message);
            return null;

        } finally {
            setLoadingEmpleados(false);
        }
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <View style={estilos.contenedor}>
            <View style={estilos.contenedorDropdown}>
                <DropdownComponent
                    label="Naves"
                    placeholder="Seleccione una nave"
                    options={navesRealm}
                    onChange={(item) => {
                        if (item) {
                            setNaveSeleccionada(item.value);
                        } else {
                            setNaveSeleccionada(null);
                        }
                    }}
                    selectedValue={naveSeleccionada}
                    style={{ backgroundColor: 'white', borderRadius: 10 }}
                />




            </View>
            <DropdownComponent
                label="Tabla"
                placeholder="Seleccione una tabla"
                options={tablasFiltradas}
                onChange={(item) => {
                    if (item) {
                        setTablaSeleccionada(item.value);
                    } else {
                        setTablaSeleccionada(null);
                    }
                }}
                selectedValue={tablaSeleccionada}
                style={{ backgroundColor: 'white', borderRadius: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity onPress={() => setMostrarFechaInicio(true)} style={estilos.selectorFecha}>
                    <Text style={estilos.etiquetaFecha}>Fecha Inicial</Text>
                    <View style={estilos.filaFecha}>
                        <Text style={estilos.textoFecha}>
                            {fechaInicio ? formatearFecha(fechaInicio) : "Seleccione fecha"}
                        </Text>
                        <Image source={calendario} style={estilos.iconoCalendario} resizeMode='center' />
                    </View>
                    {mostrarFechaInicio && (
                        <DateTimePicker
                            value={fechaInicio || new Date()}
                            mode='date'
                            display='default'
                            onChange={(evento, fechaSeleccionada) => {
                                setMostrarFechaInicio(false);
                                if (fechaSeleccionada) setFechaInicio(fechaSeleccionada);
                            }}
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMostrarFechaFin(true)} style={estilos.selectorFecha}>
                    <Text style={estilos.etiquetaFecha}>Fecha Final</Text>
                    <View style={estilos.filaFecha}>
                        <Text style={estilos.textoFecha}>
                            {fechaFin ? formatearFecha(fechaFin) : "Seleccione fecha"}
                        </Text>
                        <Image source={calendario} style={estilos.iconoCalendario} resizeMode='center' />
                    </View>
                    {mostrarFechaFin && (
                        <DateTimePicker
                            value={fechaFin || new Date()}
                            mode='date'
                            display='default'
                            onChange={(evento, fechaSeleccionada) => {
                                setMostrarFechaFin(false);
                                if (fechaSeleccionada) setFechaFin(fechaSeleccionada);
                            }}
                        />
                    )}
                </TouchableOpacity>
            </View>


            <View style={estilos.contenedorBotones}>
                <TouchableOpacity
                    onPress={manejarReporteActividades}
                    style={estilos.botonReporte}>

                    <Image source={proteccion} style={estilos.imagenBoton2} resizeMode='contain' />
                    <Text style={estilos.textoBoton}>Reporte por Actividades</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={manejarReporteEmpleados} style={estilos.botonReporte}>
                    <Image source={agricultor} style={estilos.imagenBoton} resizeMode='contain' />
                    <Text style={estilos.textoBoton}>Reporte por Empleados</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0fff0',
        paddingTop: 30,
    },
    contenedorDropdown: {
        marginBottom: 20,
    },
    contenedorBotones: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center'
    },

    botonReporte: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 22,
        elevation: 7,
        alignItems: 'center',
        marginVertical: 10,
        width: '159',
    },

    imagenBoton: {
        width: 62,
        height: 62,
    },
    imagenBoton2: {
        width: 60,
        height: 60,
    },
    textoBoton: {
        fontSize: 15,
        textAlign: 'center',
        color: 'gray',
        fontWeight: 'bold',
    },
    selectorFecha: {
        width: '45%',
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 10
    },
    etiquetaFecha: {
        width: 80,
        position: "relative",
        top: -10,
        right: -20,
        zIndex: 1,
        backgroundColor: "#f0fff0",
        fontWeight: "bold",
        color: "black"
    },
    filaFecha: {
        flexDirection: "row",
        justifyContent: "center"
    },
    textoFecha: {
        textDecorationLine: "underline",
        textAlign: "center",
        paddingTop: 5,
        paddingBottom: 15,
        color: '#333',
        paddingLeft: 5,
        fontSize: 13
    },
    iconoCalendario: {
        marginLeft: 10,
        width: 33,
        height: 33,

    },
});

export default ReportesScreen;
