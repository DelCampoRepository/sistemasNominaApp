import * as FileSystem from 'expo-file-system';

export const RUTA_EXPORT = `${FileSystem.documentDirectory}realm_export.json`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const serializarPrimitivo = (valor) => {
  if (valor === null || valor === undefined) return null;
  if (valor instanceof Date) return valor.toISOString();
  if (valor?.toHexString) return valor.toHexString();
  if (valor?.toNumber) return valor.toNumber();
  return valor;
};

const TIPOS_PRIMITIVOS = new Set(['int', 'float', 'double', 'string', 'bool', 'date', 'decimal128', 'objectId']);

const serializarObjeto = (obj, schema, realm, visitados = new Set(), profundidad = 0, MAX_PROF = 2) => {
  if (!obj) return null;

  const id = obj._objectKey?.();
  if (id && visitados.has(id)) return null;
  if (id) visitados.add(id);

  return Object.keys(schema.properties).reduce((acc, key) => {
    const prop = schema.properties[key];
    const valor = obj[key];

    if (prop.type === 'object' && valor !== null) {
      if (profundidad >= MAX_PROF) {
        acc[key] = null;
      } else {
        const subSchema = realm.schema.find(s => s.name === prop.objectType);
        acc[key] = serializarObjeto(valor, subSchema, realm, new Set(visitados), profundidad + 1, MAX_PROF);
      }
      return acc;
    }

    if (prop.type === 'list') {
      if (TIPOS_PRIMITIVOS.has(prop.objectType)) {
        acc[key] = Array.from(valor).map(serializarPrimitivo);
      } else if (profundidad >= MAX_PROF) {
        acc[key] = [];
      } else {
        const subSchema = realm.schema.find(s => s.name === prop.objectType);
        acc[key] = Array.from(valor).map(item =>
          serializarObjeto(item, subSchema, realm, new Set(visitados), profundidad + 1, MAX_PROF)
        );
      }
      return acc;
    }

    acc[key] = serializarPrimitivo(valor);
    return acc;
  }, {});
};

// ── Schemas a exportar ───────────────────────────────────────────────────────

const SCHEMAS_EXPORTAR = [
  'ActiviadesPorEmpleado',
  'EmpleadoCapturado',
  'Surco',
  'SurcoDecimal',
];

// ── Exportar ─────────────────────────────────────────────────────────────────

export const exportarRealmAJSON = async (realm, maxProfundidad = 2) => {
  try {
    const exportData = {};

    const schemasAExportar = realm.schema.filter(s =>
      SCHEMAS_EXPORTAR.includes(s.name)
    );

    schemasAExportar.forEach(schema => {
      const objetos = realm.objects(schema.name);
      exportData[schema.name] = Array.from(objetos).map(obj =>
        serializarObjeto(obj, schema, realm, new Set(), 0, maxProfundidad)
      );
    });

    const jsonString = JSON.stringify(exportData, null, 2);

    await FileSystem.writeAsStringAsync(RUTA_EXPORT, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('✅ Exportado en:', RUTA_EXPORT);
    return { ok: true, uri: RUTA_EXPORT };

  } catch (error) {
    console.error('❌ Error al exportar:', error);
    return { ok: false, error: error.message };
  }
};