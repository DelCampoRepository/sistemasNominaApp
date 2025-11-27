// UsuarioProvider.js
import React, { useState } from 'react';
import { SurcosContext } from './SurcosContext';

export const Proveedor = ({ children }) => {

    const [ListaSurcos, SetListaSurcos] = useState([]);
    const [SurcosTrabajados, setSurcosTrabajados] = useState([]);
    const [CodigoEmpleado, setCodigoEmpleado] = useState('');
    const [CodigoTemporada, setCodigoTemporada] = useState('');
    const [CodigoLote, setCodigoLote] = useState('');
    const [CodigoTabla, setCodigoTabla] = useState('');
    const [Avance, setAvance] = useState('');
    const [CodigoActividad, setCodigoActividad] = useState('');
    const [codJefNave, setCodJefNave] = useState('');
    const [navesPorUsuario, setNavesporUsuario] = useState([]);
    const [Lote, setLote] = useState('');
    const [nave, setNave] = useState('');
    const [token, setToken] = useState('')
    const [codigoAvance, setCodigoAvance] = useState('')
    const [opcion, setOpcion] = useState('')
    const [codigoUbicacion, setCodigoUbicacion] = useState('')
    const [codigoUsuario, setCodigoUsuario] = useState('')


    const [listaDeNaves, setlistaDeNaves] = useState([
        {
            indice: 0,
            nombreNave: '',
            tieneSurco: false


        }
    ])
    const [listaDeSurcosPorCodNave, setlistaPorCodNave] = useState([
        {
            indice: 0,
            codActividad: '',
            tieneSurcos: false
        }
    ])


    return (

        <SurcosContext.Provider value={{
            ListaSurcos, SetListaSurcos, SurcosTrabajados, setSurcosTrabajados,
            CodigoEmpleado, setCodigoEmpleado, CodigoTemporada, setCodigoTemporada, CodigoLote, setCodigoLote,
            CodigoTabla, setCodigoTabla, Avance, setAvance, CodigoActividad, setCodigoActividad,
            codJefNave, setCodJefNave, navesPorUsuario, setNavesporUsuario, Lote, setLote, nave, setNave,
            listaDeNaves, setlistaDeNaves, listaDeSurcosPorCodNave, setlistaPorCodNave, token, setToken,
            codigoAvance, setCodigoAvance, opcion, setOpcion, codigoUbicacion, setCodigoUbicacion, setCodigoUsuario, codigoUsuario
        }}>
            {children}
        </SurcosContext.Provider>
    )
}



export default Proveedor;
