// utils/fecha.js
import { DateTime } from 'luxon';

// GUARDAR en Realm
export const ahoraTimestamp = () => {
  return new Date();
};

// FILTRAR — inicio del día en Culiacán
export const inicioDiaCuliacan = () => {
  return new Date(DateTime.now() 
    .setZone('America/Mazatlan')
    .startOf('day')
    .toMillis());
};

// FILTRAR — fin del día en Culiacán
export const finDiaCuliacan = () => {
 
  return new Date(DateTime.now()  
    .setZone('America/Mazatlan')
    .endOf('day')
    .toMillis());
};
// MOSTRAR en pantalla
export const formatearFechaCuliacan = (fecha) => {
  if (fecha instanceof Date) {
    return DateTime.fromMillis(fecha.getTime())
      .setZone('America/Mazatlan')
      .toFormat('dd/MM/yyyy, HH:mm:ss');
  }
  if (typeof fecha === 'string') {
    return DateTime.fromISO(fecha)
      .setZone('America/Mazatlan')
      .toFormat('dd/MM/yyyy, HH:mm:ss');
  }
  
  return DateTime.fromMillis(fecha)
    .setZone('America/Mazatlan')
    .toFormat('dd/MM/yyyy, HH:mm:ss');
};


export const expiracionDosHoras = () => {
  return new Date(DateTime.now()
    .setZone('America/Mazatlan')
    .plus({ hours: 10 })
    .toMillis());
};

export const inicioDiaAyer = () => {
  let fecha = DateTime.now()
    .setZone('America/Mazatlan')
    .minus({ days: 1 });

  // Si ayer fue domingo, retrocede otro día (sábado)
  if (fecha.weekday === 7) {
    fecha = fecha.minus({ days: 1 });
  }

  return new Date(
    fecha.startOf('day').toMillis()
  );
};
export const finDiaAyer = () => {
  let fecha = DateTime.now()
    .setZone('America/Mazatlan')
    .minus({ days: 1 });

  // Si ayer fue domingo, retrocede otro día (sábado)
  if (fecha.weekday === 7) {
    fecha = fecha.minus({ days: 1 });
  }

  return new Date(
    fecha.endOf('day').toMillis()
  );
};


export const inicioDiaCuliacanFecha = (fecha) => {
  const base = fecha ? DateTime.fromJSDate(new Date(fecha)) : DateTime.now();
  return new Date(base
    .setZone('America/Mazatlan')
    .startOf('day')
    .toMillis());
};