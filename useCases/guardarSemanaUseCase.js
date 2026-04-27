

export async function GuardarSemanaEnRealm( realmInstance,data) {
    realmInstance.write(() => {
      realmInstance.create(
        "Semana",
        {
          CodigoSemana: Number(data.codigoSemana),
          CodigoTemporada: Number(data.codigoTemporada),
          FechaInicial: data.fechaFinal,
          FechaFinal: data.fechaInicial
        },
        "modified"
      );
    });
  };