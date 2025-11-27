import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Modal, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
//import { obtenerEmpleadosPorTemporada } from '../services/Empleados';
import { getRealmInstance } from '../realm';
import { obtenerEmpleadosXUsuarioYFecha } from '../services/services';
import { SurcosContext } from '../Contexts/SurcosContext';
import { obtenerEmpleadosXcodigo } from '../services/services';


const EmpleadosScreen = ({ route }) => {

    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState([]);
    const { CodigoAvance, Descripcion } = route.params.naveSeleccionada;
    const [codigoEmpleado, setCodigoEmpleado] = useState('');


    const [modalVisible, setModalVisible] = useState(false);
    const [modalDetalleVisible, setModalDetalleVisible] = useState(false);

    const [nombre, setNombre] = useState('');
    const [surco, setSurco] = useState('');
    const [avance, setAvance] = useState('');
    const [lista, setLista] = useState([]);

    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [rendimiento, setRendimiento] = useState('0');
    const [fechaActual, setFechaActual] = useState('');


    const [numeroNaveEncabezado, setNumeroNaveEncabezado] = useState('S/Nave');
    const [nombreNaveEncabezado, setNombreNaveEncabezado] = useState('Sin Nombre de Nave');
    const [descripcionActividadEncabezado, setDescripcionActividadEncabezado] = useState('Sin Actividad');
    const [numeroActividadEncabezado, setNumeroActividadEncabezado] = useState('0 - 0');
    const [seccionNaveEncabezado, setSeccionNaveEncabezado] = useState('');
    const [tablaSeleccionada, setTablaSeleccionada] = useState(Descripcion || 'Sin Tabla');
    const [tablaLabel, setTablaLabel] = useState('')
    const [cod_tabla, setCodTabla] = useState(0);

    const [realmInstance, setRealmInstance] = useState(null);


    const { nave, codJefNave, CodigoActividad, CodigoTemporada,
        setlistaDeNaves, setlistaPorCodNave, CodigoLote, CodigoTabla } = useContext(SurcosContext);




    const capitalizar = (texto) => {
        if (!texto) return '';
        return texto
            .trim()
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    //FORMATO DE FECHA
    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };


    useEffect(() => {
        const inicializarRealm = async () => {

            setRealmInstance(await getRealmInstance());
        };
        inicializarRealm();
    }, []);


    useEffect(() => {

        if (tablaLabel === "NORTE")
            setCodTabla(1);
        else if (tablaLabel === "SUR")
            setCodTabla(2);
        else { setCodTabla(1) }
    }, [tablaLabel])

    //Modales de agregar y editable
    useEffect(() => {
        setAvance('1,000');
    }, [modalVisible, modalDetalleVisible]);

    //modal tarjeta del empleado (modificable)
    const abrirModalDetalle = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setSurco('');
        setAvance('1,000');

        // Copiar los surcos existentes
        const surcosExistentes = empleado.surcos.map(s => ({
            surco: s.surco,
            avance: s.avance,
            fecha: s.fecha,
            CodigoTabla: s.CodigoTabla
        }));

        setLista(surcosExistentes);

        // reset addEmpleado para no interferir
        setAddEmpleado({
            CodigoEmpleado: '',
            Nombre: '',
            CodigoTemporada: CodigoTemporada || '',
            CodigoActividad: CodigoActividad,
            CodigoLote: CodigoLote,
            CodigoNave: nave,
            surcos: []
        });

        setModalDetalleVisible(true);
    };




    const handleSurcos = (valor) => {
        if (valor === 1) {
            setAddEmpleado(prev => ({
                ...prev,
                surcos: [],
                tieneSurcos: false
            }));
            return;
        }

        if (valor.surco > 49) {
            Alert.alert('Del Campo y Asociados', 'La nave contiene un máximo de 49 surco(s).');
            return;
        }



        if (addEmpleado.surcos?.some(item => item.surco === valor.surco)) {
            Alert.alert('Del Campo y Asociados', `El empleado ya tiene asignado el surco ${valor.surco}.`);
            return;
        }



        setAddEmpleado(prev => ({
            ...prev,
            surcos: [
                ...(prev.surcos || []), valor],
            tieneSurcos: true

        }))
    }

    // Función para manejar el cambio en el input de avance y asegurar que solo sea "1,000"
    const handleAvanceChange = (text) => {
        if (text === '1' || text === '1,') {
            setAvance('1,000');
        } else if (text === '') {
            setAvance(''); // Permite borrar el texto para no tener el 1,000 estático
        }
    };


    const handleLlenarDatosEmp = (campo, valor) => {

        if (campo == 'surcos') {
            setAddEmpleado(prev => ({
                ...prev,
                surcos: [
                    ...(prev.surcos || [],
                        { ...prev.surcos, valor }
                    )
                ]
            }));
        }
        else {
            setAddEmpleado(prev => ({
                ...prev,
                [campo]: valor,
                tieneSurcos: true
            }));
        }

    };


    const [addEmpleado, setAddEmpleado] = useState({
        CodigoEmpleado: '',
        Nombre: '',
        CodigoTemporada: CodigoTemporada || '',
        CodigoActividad: CodigoActividad,
        CodigoLote: CodigoLote,
        CodigoNave: nave,
        surcos: [],
        tieneSurcos: false
    })


    //Funcion para eliminar surco
    const eliminarSurco = async (index) => {
        // ( Modal para editar)
        if (empleadoSeleccionado) {
            const surcoAEliminar = lista[index].surco;

            Alert.alert(
                "Del Campo y Asociados",
                `¿Desea eliminar el surco ${surcoAEliminar}?`,
                [
                    { text: "No", style: "cancel" },
                    {
                        text: "Sí",
                        onPress: async () => {
                            try {

                                const nuevaLista = [...lista];
                                nuevaLista.splice(index, 1);
                                setLista(nuevaLista);

                                // Borra en Realm
                                const realm = await getRealmInstance();
                                realm.write(() => {
                                    const empleado = realm
                                        .objects("Empleado")
                                        .filtered("CodigoEmpleado == $0", empleadoSeleccionado.CodigoEmpleado)[0];

                                    if (empleado) {
                                        const valor = String(surcoAEliminar);
                                        const registros = empleado.surcos.filtered("surco == $0", valor);
                                        realm.delete(registros);
                                        empleado.tieneSurcos = empleado.surcos.length > 0;

                                    }
                                });
                                await aceptarEmpleado(empleadoSeleccionado.CodigoEmpleado);
                                await verificacionAct()
                                await verificacionTabla()
                                await verificacionNave()

                            } catch (error) {
                                console.error("Error al eliminar surco:", error);
                            }
                        },
                    },
                ],
                { cancelable: false }
            );
            return;
        }

        // (modal para agregar)
        const surcoAEliminar = addEmpleado.surcos[index];
        Alert.alert(
            "Del Campo y Asociados",
            `¿Desea eliminar el surco ${surcoAEliminar.surco}?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí",
                    onPress: () => {
                        try {
                            const nuevaLista = [...addEmpleado.surcos];
                            nuevaLista.splice(index, 1);
                            setAddEmpleado(prev => ({
                                ...prev, surcos: nuevaLista, tieneSurcos: nuevaLista.length > 0
                            }));
                        } catch (error) {
                            console.error("Error al eliminar surco:", error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };



    //mantener la lista de empleados en tu aplicación actualizada en tiempo real.
    useEffect(() => {
        let empleadosRealm;
        const setupRealmListener = async () => {
            try {
                empleadosRealm = realmInstance.objects('Empleado');
                empleadosRealm.addListener(() => {
                    setEmpleados([...empleadosRealm]);
                }

                );
            } catch (error) {
                console.error("Error al configurar el listener de Realm:", error);
            }
        };


        const verlista = async () => {
            realmInstance.write(() => {

                const empleadosABorrar = realmInstance.objects('Empleado').filtered('CodigoEmpleado == $0', "");

                realmInstance.delete(empleadosABorrar);
            })
        }

        if (realmInstance != null) {
            setupRealmListener();
            verlista();

        }

        return () => {
            if (empleadosRealm) {
                empleadosRealm.removeAllListeners();
            }
        };
    }, [realmInstance]);


    useEffect(() => {
        if (realmInstance) {
            cargarEmpleados();
        }
    }, [realmInstance]);

    //LISTA DE EMPLEADOS
    const cargarEmpleados = async () => {
        setLoading(true);
        try {

            const codigoJefe = codJefNave;

            const fechaActual = new Date();

            const response = await obtenerEmpleadosXUsuarioYFecha(CodigoTemporada, codigoJefe, fechaActual, CodigoLote, nave, cod_tabla);

            if (!response?.data?.forEach) {
                setLoading(false);
                return;
            }


            realmInstance.write(() => {
                response.data.forEach(emp => {

                    const existingEmployee = realmInstance.objectForPrimaryKey('Empleado', emp.CodigoEmpleado);
                    if (!existingEmployee) {
                        // Crea una lista vacía para los surcos.
                        let surcosDelServicio = [];

                        // Solo agrega el surco si los valores son mayores a 0.
                        if (emp.CantidadSurcos > 0 || emp.Avance > 0) {
                            surcosDelServicio.push({
                                surco: String(emp.CantidadSurcos),
                                avance: String(emp.Avance),
                                fecha: new Date("2026-01-06"),
                                CodigoTabla: String(CodigoTabla)

                            });

                        }


                        realmInstance.create('Empleado', {
                            CodigoEmpleado: emp.CodigoEmpleado,
                            Nombre: emp.Nombre,
                            CodigoTemporada: emp.CodigoTemporada,
                            CodigoLote: emp.CodigoLote,
                            CodigoNave: emp.CodigoNave,
                            CodigoActividad: emp.CodigoActividad,
                            CodigoAvance: String(emp.CodigoAvance),
                            surcos: surcosDelServicio

                        }
                        );
                    }
                    const empleado = realmInstance.objects('Empleado');

                    // console.log("Surcos en Realm:", empleado);
                });
            });


        } catch (error) {
            console.error("Error al cargar empleados:", error.message);
            Alert.alert("Del Campo y Asociados", "No se pudieron cargar los empleados.");
        } finally {
            setLoading(false);
        }
    };



    const buscarEmpleadoPorCodigo = async () => {

        if (addEmpleado.CodigoEmpleado === '') {
            Alert.alert("Del Campo y Asociados", "Por favor, ingresa un código de empleado para buscar.");
            setNombre('');
            return;
        }


        try {

            const resultado = await obtenerEmpleadosXcodigo(addEmpleado.CodigoEmpleado)
            //console.log(resultado.data[0].CodigoEmpleado, "dddd");

            if (resultado) {
                const empleado = realmInstance
                    .objects('Empleado')
                    .filtered('CodigoEmpleado == $0', resultado.data[0].CodigoEmpleado.trim());


                //console.log(empleado, 'lista de em')
                if (empleado.length == 0) {

                    handleLlenarDatosEmp("Nombre", resultado.data[0].Nombre)
                } else {
                    const nombreCapitalizado = capitalizar(resultado.data[0].Nombre);


                    Alert.alert('Del Campo y Asociados', `El Empleado "${nombreCapitalizado}" ya está en la lista!`
                    ); handleLlenarDatosEmp("Nombre", '')
                }
            }
            else {
                Alert.alert('Del Campo y Asociados', `No se encontró el codigo de empleado "${addEmpleado.CodigoEmpleado}"`);
                handleLlenarDatosEmp("CodigoEmpleado", '')
            }

        } catch (error) {
            Alert.alert("Del Campo y Asociados", "No se encontró el codigo de empleado.");
        }
    };




    //funcion para agregar empleados desde el modal agregar
    const agregarEmpleado = async () => {

        if (!addEmpleado.CodigoEmpleado || !addEmpleado.Nombre) {
            Alert.alert('Del Campo y Asociados', 'Debe ingresar un código de empleado válido y presionar Buscar.');
            return;
        }

        const surcoNumerico = parseInt(surco, 10);
        if (!surco || !avance || isNaN(surcoNumerico) || surcoNumerico <= 0) {
            Alert.alert('Del Campo y Asociados', 'Debe ingresar un surco válido y un avance.');
            return;
        }

        if (surcoNumerico > 49) {
            Alert.alert('Del Campo y Asociados', 'La nave contiene un máximo de 49 surco(s).');
            return;
        }

        // Verifica si ya está en la lista local
        if (lista.some(item => item.surco === surco)) {
            Alert.alert('Del Campo y Asociados', `El empleado ya tiene asignado el surco ${surco}.`);
            return;
        }

        try {

            // Calcula el inicio y fin de la semana actual
            const hoy = new Date();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // lunes
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6); // domingo
            finSemana.setHours(23, 59, 59, 999);

            // Verifica si el surco ya fue trabajado por cualquier empleado esta semana
            const empleados = realmInstance.objects("Empleado");
            const surcoDuplicado = empleados.filtered(
                "ANY surcos.surco == $0 AND ANY surcos.fecha >= $1 AND ANY surcos.fecha <= $2",
                surco,
                inicioSemana,
                finSemana
            );

            if (surcoDuplicado.length > 0) {
                Alert.alert('Del Campo y Asociados', `El surco ${surco} ya fue trabajado esta semana por otro empleado.`);
                setSurco('');

                return;
            }

            // Si no está duplicado, lo agregamos al empleado localmente
            handleSurcos({ surco: String(surco), avance: String(avance), fecha: new Date(), CodigoTabla: String(CodigoTabla) });

            setSurco('');



        } catch (error) {
            console.error('Error al agregar surco:', error);
            Alert.alert('Del Campo y Asociados', 'Ocurrió un error al verificar el surco.');
        }
    };




    // registra y valida (botón dentro del modal detalle)
    const BotonAgregarMini = async () => {
        if (!empleadoSeleccionado) {
            Alert.alert('Del Campo y Asociados', 'No se ha seleccionado un empleado.');
            return;
        }

        const surcoNumerico = parseInt(surco, 10);
        // Valida que los campos no estén vacíos y que el surco sea un número válido mayor a 0.
        if (!surco || !avance || isNaN(surcoNumerico) || surcoNumerico <= 0) {
            Alert.alert('Del Campo y Asociados', 'Debe ingresar un surco válido y un avance.');
            return;
        }

        if (surcoNumerico > 49) {
            Alert.alert('Del Campo y Asociados', 'La nave contiene un máximo de 49 surco(s).');
            return;
        }

        // Valida si el surco ya existe en la lista local temporal.
        if (lista.some(item => item.surco === surco)) {
            Alert.alert('Del Campo y Asociados', `El empleado ya tiene asignado el surco ${surco}.`);
            return;
        }

        try {
            const hoy = new Date();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            // Valida si el surco ya fue trabajado esta semana por OTRO empleado.
            const surcoDuplicado = realmInstance.objects("Empleado").filtered(
                "CodigoEmpleado != $0 AND ANY surcos.surco == $1 AND ANY surcos.fecha >= $2 AND ANY surcos.fecha <= $3",
                empleadoSeleccionado.CodigoEmpleado,
                surco,
                inicioSemana,
                finSemana
            );

            if (surcoDuplicado.length > 0) {
                Alert.alert(
                    'Del Campo y Asociados',
                    `El surco ${surco} ya fue trabajado esta semana por otro empleado.`
                );
                setSurco('');

                return;
            }

            setLista((prev) => [
                ...prev,
                {
                    codigoEmpleado: empleadoSeleccionado.CodigoEmpleado,
                    surco,
                    avance,
                    fecha: new Date()
                }
            ]);

            setSurco('');

        } catch (e) {
            console.error('Error en BotonAgregarMini:', e);
            Alert.alert('Del Campo y Asociados', 'Ocurrió un error al verificar el surco.');
        }
    };


    const aceptarEmpleado = async (codigoEmpleado) => {
        let tieneSurcos = false;

        realmInstance.write(() => {
            const emp = realmInstance.objectForPrimaryKey("Empleado", codigoEmpleado);
            if (emp) {
                if (emp.surcos.length > 0) {
                    emp.tieneSurcos = true;
                    tieneSurcos = true;
                } else {
                    emp.tieneSurcos = false;
                    tieneSurcos = false;
                }
            }
        });

        // Marcar o quitar palomita en la actividad
        setlistaPorCodNave(prev =>
            prev.map(act =>
                act.codActividad === CodigoActividad
                    ? { ...act, tieneSurcos: tieneSurcos }
                    : act
            )
        );

        // Marcar o quitar palomita en la nave
        setlistaDeNaves(prev =>
            prev.map(n =>
                n.nombreNave === nave
                    ? { ...n, tieneSurcos: tieneSurcos }
                    : n
            )
        );
    };




    // Función  para guardar cambios (sirve para agregar y para detalle)
    const guardarEmpleado = async (opcion) => {

        const empleado = empleadoSeleccionado || { CodigoEmpleado: codigoEmpleado, Nombre: nombre };
        if (opcion == 1) {


            if (!addEmpleado.CodigoEmpleado || !addEmpleado.Nombre) {
                Alert.alert('Del Campo y Asociados', 'Debe ingresar un código de empleado válido y presionar Buscar.');
                return;
            }

            if (addEmpleado.surcos.length <= 0) {
                Alert.alert('Del Campo y Asociados', 'Capture un numero de surco. ')
                return;
            }

            setAddEmpleado("CodigoActividad", CodigoActividad)
            setAddEmpleado("CodigoAvance", CodigoAvance)
            setAddEmpleado("CodigoNave", nave)
            setAddEmpleado('CodigoLote', CodigoLote)
            console.log(addEmpleado, 'addEmpleado')
            try {
                realmInstance.write(() => {


                    realmInstance.create('Empleado', {
                        CodigoEmpleado: addEmpleado.CodigoEmpleado,
                        Nombre: addEmpleado.Nombre,
                        CodigoTemporada: String(CodigoTemporada) || '',
                        CodigoLote: String(CodigoLote) || '',
                        CodigoNave: nave || '',
                        CodigoActividad: String(CodigoActividad) || '',
                        CodigoAvance: String(CodigoAvance) || '',
                        surcos: addEmpleado.surcos,
                        tieneSurcos: addEmpleado.surcos.length > 0,

                    });

                })

                await aceptarEmpleado(addEmpleado.CodigoEmpleado);

                setModalVisible(false)

                await verificacionAct()
                await verificacionTabla()
            }
            catch (error) {
                console.error(error)
            }
        }
        else {

            if (!empleado.CodigoEmpleado || !empleado.Nombre) {
                Alert.alert("Del Campo y Asociados", "Capture un código de empleado válido");
                return;
            }

            //Cierra el modal aunque no tenga ningun dato puesto
            if (lista.length === 0) {
                setModalVisible(false);
                setModalDetalleVisible(false);
                setCodigoEmpleado('');
                setNombre('');
                setLista([]);
                setEmpleadoSeleccionado(null);
                return;
            }



            try {

                realmInstance.write(() => {
                    let emp = realmInstance.objectForPrimaryKey('Empleado', empleado.CodigoEmpleado);

                    if (emp) {
                        emp.surcos = lista.map(item => ({
                            surco: String(item.surco),
                            avance: String(item.avance),
                            fecha: item.fecha || new Date(),
                            CodigoTabla: String(CodigoTabla)
                        }));

                        emp.tieneSurcos = emp.surcos.length > 0;

                    } else {
                        // Si no existe lo crea
                        realmInstance.create('Empleado', {
                            CodigoEmpleado: empleado.CodigoEmpleado,
                            Nombre: empleado.Nombre,
                            CodigoTemporada: empleado.CodigoTemporada,
                            surcos: lista.map(item => ({
                                surco: item.surco,
                                avance: item.avance,
                                fecha: item.fecha || new Date(),

                                tieneSurcos: lista.length > 0,

                            })),

                        });
                    }

                });
                await aceptarEmpleado(empleado.CodigoEmpleado);

                setModalVisible(false);
                setModalDetalleVisible(false);


                setCodigoEmpleado('');
                setNombre('');
                setLista([]);
                setEmpleadoSeleccionado(null);

                await verificacionAct()
                await verificacionTabla()
                await verificacionNave()
                //  console.log(`Empleado ${empleado.CodigoEmpleado} guardado con surcos:`, lista);

            } catch (error) {
                console.error("Error en guardarEmpleado:", error.message);
                Alert.alert("Del Campo y Asociados", "No se pudo guardar el empleado.");
            }
        }
    };


    // Datos del encabezado
    useEffect(() => {
        setFechaActual(getFormattedDate());

        const { actividadSeleccionada, naveSeleccionada } = route.params || {};
        const { tablaLabel } = route.params.naveSeleccionada || {};
        const { CodigoLote } = route.params.actividadSeleccionada || {};

        // Actividad
        if (actividadSeleccionada) {
            setRendimiento(
                actividadSeleccionada.Rendimiento ? actividadSeleccionada.Rendimiento.toString() : '0'
            );
            setDescripcionActividadEncabezado(capitalizar(actividadSeleccionada.Descripcion));
            setNumeroActividadEncabezado(
                `${actividadSeleccionada.CodigoActividad || '0'} - ${actividadSeleccionada.CodigoAvance || '0'}`
            );
        } else {
            setRendimiento('0');
            setDescripcionActividadEncabezado('Sin Actividad');
            setNumeroActividadEncabezado('0 - 0');
        }

        // Nave
        if (naveSeleccionada) {
            setNumeroNaveEncabezado(naveSeleccionada.numeroNave || 'S/Nave');
            setNombreNaveEncabezado(naveSeleccionada.nombreNave || 'Sin Nombre de Nave');
            setSeccionNaveEncabezado(naveSeleccionada.seccion || '');
        } else {
            setNumeroNaveEncabezado('S/Nave');
            setNombreNaveEncabezado('Sin Nombre de Nave');
            setSeccionNaveEncabezado('');
        }

    }, [route.params, realmInstance]);



    //mostrar los surcos que ha trabajado y el total de avance que ha completado.
    const renderItem = ({ item }) => {

        // Solo mostramos surcos si tieneSurcos = true
        const surcosAgregados = item.tieneSurcos && item.surcos && item.surcos.length > 0
            ? item.surcos.map(s => s.surco).join(', ')
            : ''; // vacío si no tiene surcos agregados

        const totalAvanceNumerico = item.tieneSurcos && item.surcos
            ? item.surcos.reduce((sum, s) => {
                const avanceNumerico = parseFloat(s.avance.replace(',', '.'));
                return sum + (isNaN(avanceNumerico) ? 0 : avanceNumerico);
            }, 0)
            : 0;

        // Si no hay avance, mostramos '0'
        const totalAvance = totalAvanceNumerico > 0
            ? totalAvanceNumerico.toFixed(3).replace(/\.000$/, '')
            : '0';


        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => abrirModalDetalle(item)}>

                <Image source={require('../assets/usuario2.png')} style={styles.avatar} />
                <Text style={styles.codigo}>{item.CodigoEmpleado}</Text>
                <Text style={styles.nombre}>{capitalizar(item.Nombre)}</Text>

                <Text style={styles.surc}>Surc: {surcosAgregados}</Text>
                <View style={styles.avanceContainer}>

                    <Text style={styles.avanceLabel}>Avance:</Text>
                    <View style={styles.avanceBox}>
                        <Text style={styles.avanceText}>{totalAvance}</Text>
                    </View>
                </View>

                <Image
                    source={require('../assets/check...png')}
                    style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        width: 25,
                        height: 25,
                        opacity: item.tieneSurcos ? 1 : 0,
                    }}
                />
            </TouchableOpacity>
        );
    };

    //MINI VENTANA DE LOS SURCOS Y AVANCE TRABAJADO
    const renderItemPreview = ({ item, index }) => {

        const avanceMostrado = '1' //item.avance.includes(',') ? item.avance.split(',')[0] : item.avance;
        return (
            <View style={styles.itemPreview}>
                <TouchableOpacity onPress={() => eliminarSurco(index)} style={styles.eliminarBoton}>
                    <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
                <Text style={styles.surcoPreview}>{item.surco}</Text>
                <Text style={styles.avancePreview}>A: {avanceMostrado}</Text>
            </View>
        );
    };



    const verificacionAct = async () => {
        try {
            const realm = await getRealmInstance();

            // 1. Busca si existe AL MENOS UN empleado en la lista con surcos para esta actividad y nave.
            const empleadosConSurcos = realm.objects('Empleado').filtered(
                'CodigoActividad == $0 AND CodigoNave == $1 AND surcos.@size > 0',
                CodigoActividad, // 👈 Se obtiene del useContext/estado
                nave              // 👈 Se obtiene del useContext/estado
            );

            // 2. Determina el valor booleano (true si se encontró al menos un empleado con surcos)
            const hayEmpleadosConSurcos = empleadosConSurcos.length > 0;

            //  console.log("=======================================");
            //console.log(`[VERIFICACION] Actividad: ${CodigoActividad}, Nave: ${nave}`);
            // console.log(`[VERIFICACION] Empleados encontrados con surcos: ${empleadosConSurcos.length}`);
            //console.log(`[VERIFICACION] El nuevo estado de 'tieneSurcos' será: ${hayEmpleadosConSurcos}`);
            // console.log("=======================================");

            // 3. Obtiene el registro de la Actividad
            const actividadesRealm = realm.objects('Actividades').filtered(
                'CodigoActividad == $0 AND CodigoAvance == $1',
                numeroActividadEncabezado.substring(0, 3),
                numeroActividadEncabezado.substring(6, 9)
            );

            if (actividadesRealm.length > 0) {
                realm.write(() => {
                    // 4. Actualiza la propiedad 'tieneSurcos' de la Actividad
                    actividadesRealm[0].tieneSurcos = hayEmpleadosConSurcos;
                });
            }

        } catch (error) {
            console.error("Error en verificacionAct:", error);
        }
    };




    const verificacionTabla = async () => {
        const realm = await getRealmInstance();

        // Buscar empleados con surcos en esta tabla
        const empleadosConSurcos = realm.objects('Empleado').filtered(
            'CodigoActividad == $0 AND CodigoNave == $1 AND surcos.@size > 0',
            CodigoActividad,
            nave
        );

        const haySurcos = empleadosConSurcos.length > 0;

        const tablaRealm = realm.objects("Tablas").filtered('Descripcion == $0', tablaLabel);
        if (tablaRealm.length > 0) {
            realm.write(() => {
                tablaRealm[0].tieneSurcos = haySurcos;
            });
        }
    };



    const verificacionNave = async () => {
        try {
            const realm = await getRealmInstance();
            const empleadosConSurcos = realm.objects('Empleado').filtered(
                'CodigoNave == $0 AND surcos.@size > 0',
                nave
            );
            const hayEmpleadosConSurcos = empleadosConSurcos.length > 0;

            const naveRealm = realm.objects('Nave').filtered('CodigoNave == $0', nave);
            if (naveRealm.length > 0) {
                realm.write(() => {
                    naveRealm[0].tieneSurcos = hayEmpleadosConSurcos;
                });
            }
        } catch (error) {
            console.error("Error en verificacionNave:", error);
        }
    };


    return (
        //ENCABEZADO
        <View style={styles.container}>
            <View style={styles.infoSuperior}>

                <Text style={styles.infoText}>
                    {numeroNaveEncabezado}
                    {seccionNaveEncabezado ? ` (${seccionNaveEncabezado})` : ''}
                </Text>
                <Text style={styles.infoText}>
                    {nombreNaveEncabezado}
                </Text>



                <Text style={styles.infoText}>
                    {numeroActividadEncabezado} - {descripcionActividadEncabezado}
                </Text>

                <Text style={styles.infoText}>
                    {Descripcion}
                </Text>

                <View style={styles.rowInfo}>
                    <Text style={styles.infoText}>Rendimiento: {rendimiento.substring(0, 5)}</Text>
                    <Text style={styles.infoText}>{fechaActual}</Text>
                </View>

            </View>



            {loading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="green" style={{ marginTop: 30 }} />
                </View>

            ) : (
                <FlatList
                    data={empleados}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.CodigoEmpleado.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.lista}
                />
            )}




            <TouchableOpacity style={styles.botonAgregar} onPress={() => {
                setModalVisible(true);
                setCodigoEmpleado('');
                setNombre('');
                setSurco('');
                setAvance('1,000');
                setLista([]);
                handleSurcos(1)
                handleLlenarDatosEmp('CodigoEmpleado', '');
                handleLlenarDatosEmp('Nombre', '');

            }}>
                <Ionicons name="person-add" size={35} color="white" />
            </TouchableOpacity>


            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.nuevoModalContent}>


                        <TouchableOpacity
                            style={styles.cerrarIcono}
                            onPress={() => {
                                setModalVisible(false);
                                setAvance('1,000');
                            }}
                        >
                            <Image
                                source={require('../assets/cerraar.png')}
                                style={{ width: 30, height: 30 }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>


                        <View style={styles.filaCodigoBuscar}>
                            <View style={styles.inputCodigoBox}>
                                <Text style={styles.label}>Código Empleado</Text>
                                <TextInput
                                    style={styles.input}
                                    value={addEmpleado.CodigoEmpleado?.toString() || ""}
                                    onChangeText={(text) => handleLlenarDatosEmp('CodigoEmpleado', text)}
                                    autoCapitalize="none"
                                    keyboardType="numeric"
                                />
                            </View>


                            <TouchableOpacity
                                style={[styles.botonBuscar, !addEmpleado.CodigoEmpleado && { backgroundColor: 'green' }]}
                                onPress={buscarEmpleadoPorCodigo}
                                disabled={!addEmpleado.CodigoEmpleado}
                            >
                                <Text style={styles.botonTexto}>Buscar</Text>
                            </TouchableOpacity>
                        </View>





                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            value={addEmpleado.Nombre}
                            style={[styles.input, styles.nombreBloqueado]}

                            onChange={(text) => handleLlenarDatosEmp('Nombre', text)}
                            editable={false}
                        />



                        <View style={styles.filaSurcoAvance}>
                            <View style={styles.boxInputChico}>
                                <Text style={styles.label}>Surco</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setSurco}
                                    value={surco}
                                    keyboardType="numeric"
                                    maxLength={2}

                                />
                            </View>


                            <View style={styles.boxInputChico}>
                                <Text style={styles.label}>Avance</Text>
                                <TextInput
                                    style={styles.input}
                                    value={avance}
                                    onBlur={() => setAvance('1,000')}
                                    onFocus={() => setAvance('1')}
                                    onChangeText={handleAvanceChange}
                                    keyboardType="numeric"
                                    editable={true}
                                />
                            </View>


                            <TouchableOpacity style={styles.botonAgregarMini} onPress={agregarEmpleado}>
                                <Text style={styles.botonTexto}>Agregar</Text>
                            </TouchableOpacity>

                        </View>


                        <View style={styles.zonaGrisPreview}>
                            <FlatList
                                data={addEmpleado.surcos}
                                renderItem={renderItemPreview}
                                keyExtractor={(item, index,) => index.toString()}
                                horizontal={false}
                                numColumns={4}
                                contentContainerStyle={styles.flatlistContent}
                            />
                        </View>

                        <TouchableOpacity style={styles.botonAceptar} onPress={() => guardarEmpleado(1)}>
                            <Text style={styles.botonTexto}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            <Modal visible={modalDetalleVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.nuevoModalContent}>
                        <TouchableOpacity
                            style={styles.cerrarIcono}
                            onPress={() => {
                                setModalDetalleVisible(false);
                                setLista([]);
                                setEmpleadoSeleccionado(null);
                            }}
                        >
                            <Image
                                source={require('../assets/cerraar.png')}
                                style={{ width: 30, height: 30 }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>



                        <View style={styles.filaCodigoBuscar}>
                            <View style={styles.inputCodigoBox}>
                                <Text style={styles.label}>Código Empleado</Text>
                                <TextInput
                                    style={[styles.input, styles.nombreBloqueado]}
                                    value={empleadoSeleccionado ? empleadoSeleccionado.CodigoEmpleado.toString() : ''}
                                    editable={false}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.botonBuscar, { backgroundColor: '#999' }]}
                                disabled={true}

                            >
                                <Text style={styles.botonTexto}>Buscar</Text>
                            </TouchableOpacity>
                        </View>




                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={[styles.input, styles.nombreBloqueado]}
                            value={empleadoSeleccionado ? capitalizar(empleadoSeleccionado.Nombre) : ''}
                            editable={false}
                        />




                        <View style={styles.filaSurcoAvance}>
                            <View style={styles.boxInputChico}>
                                <Text style={styles.label}>Surco</Text>
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setSurco}
                                    value={surco}
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                            </View>



                            <View style={styles.boxInputChico}>
                                <Text style={styles.label}>Avance</Text>
                                <TextInput
                                    style={styles.input}
                                    value={avance}
                                    onBlur={() => setAvance('1,000')}
                                    onFocus={() => setAvance('1')}
                                    onChangeText={handleAvanceChange}
                                    keyboardType="numeric"
                                />
                            </View>



                            <TouchableOpacity style={styles.botonAgregarMini} onPress={BotonAgregarMini}>
                                <Text style={styles.botonTexto}>Agregar</Text>
                            </TouchableOpacity>
                        </View>




                        <View style={styles.zonaGrisPreview}>
                            <FlatList
                                data={lista}
                                renderItem={renderItemPreview}
                                keyExtractor={(item, index) => index.toString()}
                                horizontal={false}
                                numColumns={4}
                                contentContainerStyle={styles.flatlistContent}
                            />
                        </View>


                        <TouchableOpacity style={styles.botonAceptar} onPress={() => guardarEmpleado(2)}>
                            <Text style={styles.botonTexto}>Aceptar</Text>
                        </TouchableOpacity>



                    </View>
                </View>
            </Modal>
        </View>
    );

}
export default EmpleadosScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fff0',
        padding: 3,
    },

    botonContainer: { marginTop: 10 },


    infoSuperior: {
        padding: 10,
        backgroundColor: '#B3E0B3',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#333'
    },
    rowInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    lista: {
        paddingBottom: 100,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 7,
        width: '30%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minHeight: 120,
        justifyContent: 'center',
        position: 'relative'
    },

    avatar: {
        width: 45,
        height: 45,
        borderRadius: 20,
        marginBottom: 5,
    },
    codigo: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    nombre: {
        textAlign: 'center',
        fontSize: 12.1,
        marginBottom: 5,
        textTransform: 'capitalize',
        color: '#666',
        fontWeight: 'bold'
    },
    surc: {
        fontSize: 12,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    avanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    avanceLabel: {
        color: 'green',
        fontSize: 12,
        fontWeight: 'bold'
    },
    avanceBox: {
        backgroundColor: 'green',
        paddingHorizontal: 6,
        borderRadius: 3,
        marginLeft: 6,
    },
    avanceText: {
        color: 'white',
        fontWeight: 'bold',
    },
    botonAgregar: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'green',
        borderRadius: 40,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#00000099',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    cerrar: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        alignSelf: 'flex-start',
        fontWeight: 'bold',
        marginTop: 7,
        fontSize: 14
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        width: '100%',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 5,
    },
    nombreBloqueado: {
        backgroundColor: '#ddd',
    },
    botonBuscar: {
        backgroundColor: 'green',
        marginTop: 15,
        paddingVertical: 7,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    botonTexto: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13
    },
    botonModal: {
        backgroundColor: 'green',
        marginTop: 20,
        paddingVertical: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    nuevoModalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    cerrarIcono: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    filaCodigoBuscar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        width: '100%',
        gap: 11,
        marginBottom: 8,
    },
    filaSurcoAvance: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        gap: 10,
        marginTop: 15,
    },
    boxInputChico: {
        flex: 1,
    },
    botonAgregarMini: {
        backgroundColor: 'green',
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    zonaGrisPreview: {
        backgroundColor: '#ccc',
        height: 145,
        width: '100%',
        marginTop: 20,
        borderRadius: 10,
    },
    flatlistContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    botonAceptar: {
        backgroundColor: 'green',
        marginTop: 18,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    botonBuscar: {
        backgroundColor: 'green',
        paddingVertical: 6.5,
        paddingHorizontal: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemPreview: {
        backgroundColor: 'white',
        margin: 7,
        padding: 2,
        borderRadius: 10,
        alignItems: 'center',
        width: 60,
        height: 50,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'green',
        position: 'relative'
    },
    surcoPreview: {
        fontSize: 13.5,
        color: '#666',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    avancePreview: {
        fontSize: 12,
        color: 'green',
        textAlign: 'center',
        marginTop: 2,
        fontWeight: 'bold'
    },
    eliminarBoton: {
        position: 'absolute',
        top: -10,
        right: -10,
        zIndex: 1,
    },
    loadingOverlay: {
        flex: 1, // 👈 Importante: Esto hace que ocupe todo el espacio vertical disponible
        justifyContent: 'center', // 👈 Centra el contenido (ActivityIndicator) verticalmente
        alignItems: 'center',    // 👈 Centra el contenido horizontalmente
    },
});