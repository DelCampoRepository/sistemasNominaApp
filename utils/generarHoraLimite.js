//funcion que nos regresa el dia actual con la hora  dia + 11:59:59

export function fecha() {
    
    const ahora = new Date();

    const fechaLocalSinUTC = new Date(
      Date.UTC(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        ahora.getHours(),
        ahora.getMinutes(),
        ahora.getSeconds(),
        ahora.getMilliseconds()
      )
    );

    fechaLocalSinUTC.setHours(23, 59, 59, 999);
    return fechaLocalSinUTC;
  }

