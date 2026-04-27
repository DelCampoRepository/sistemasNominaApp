
import * as FileSystem from 'expo-file-system';

// ── Helpers ──────────────────────────────────────────────────────────────────

const serializarPrimitivo = (valor) => {
  if (valor === null || valor === undefined) return null;
  if (valor instanceof Date) return valor.toISOString();
  if (valor?.toHexString) return valor.toHexString();
  return valor;
};

const serializarObjeto = (obj, schema, realm, visitados = new Set(), profundidad = 0, MAX_PROF = 2) => {
  if (!obj) return null;

  const id = obj._objectKey?.();
  if (id && visitados.has(id)) return null;
  if (id) visitados.add(id);

  return Object.keys(schema.properties).reduce((acc, key) => {
    const prop = schema.properties[key];
    const valor = obj[key];

    // Relación a un objeto
    if (prop.type === 'object' && valor !== null) {
      if (profundidad >= MAX_PROF) {
        acc[key] = null;
      } else {
        const subSchema = realm.schema.find(s => s.name === prop.objectType);
        acc[key] = serializarObjeto(valor, subSchema, realm, new Set(visitados), profundidad + 1, MAX_PROF);
      }
      return acc;
    }

    // Lista de objetos o primitivos
    if (prop.type === 'list') {
      if (prop.objectType === 'int' || prop.objectType === 'float' ||
          prop.objectType === 'string' || prop.objectType === 'bool') {
        // Lista de primitivos
        acc[key] = Array.from(valor);
      } else if (profundidad >= MAX_PROF) {
        acc[key] = [];
      } else {
        // Lista de objetos relacionados
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
  // SurcoAvance se omite aquí porque ya viene embebido en EmpleadoCapturado
];

// ── Exportar ─────────────────────────────────────────────────────────────────

export const exportarRealmAJSON2 = async (realm, maxProfundidad = 2) => {
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

    // Pide al usuario que elija la carpeta destino (funciona en Android 11+)
    const permisos = await FileSystem.StorageAccessFramework
      .requestDirectoryPermissionsAsync();

    if (!permisos.granted) {
      console.warn('Permiso denegado');
      return;
    }

    const uri = await FileSystem.StorageAccessFramework.createFileAsync(
      permisos.directoryUri,
      'realm_export.json',
      'application/json'
    );

    await FileSystem.writeAsStringAsync(uri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8
    });

    console.log('✅ Exportado correctamente en:', uri);

  } catch (error) {
    console.error('❌ Error al exportar:', error);
  }
};