import { getRealmInstance } from "../realm";
import Realm from "realm";

export const safeLogout = async () => {
    try {
        const realm = await getRealmInstance();

        if (!realm.isClosed) {
            realm.write(() => {
                // Opcional: borrar todos los objetos si quieres reset completo
                realm.deleteAll();
            });

            realm.close(); // cierra Realm para que no queden objetos activos
            Realm.deleteFile(realm.path); // elimina archivo físico
        }

        console.log("✅ Realm cerrado y eliminado correctamente");
    } catch (error) {
        console.error("❌ Error al cerrar Realm:", error);
    }
};
