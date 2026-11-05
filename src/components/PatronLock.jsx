import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { View, StyleSheet, PanResponder } from "react-native";

const FILAS_COLUMNAS = 3;

// Patrón de acceso tipo "lock pattern" de Android: una cuadrícula de 3x3
// puntos que el usuario conecta arrastrando el dedo. No usa ninguna librería
// nueva (ni svg ni gesture-handler): el trazo se detecta con PanResponder
// (incluido en react-native) y las líneas se dibujan con Views rotados.
const PatronLock = forwardRef(function PatronLock(
  { size = 260, disabled = false, onPatronCompleto, onPatronIncompleto },
  ref
) {
  const [layout, setLayout] = useState(null);
  const [ruta, setRuta] = useState([]);
  const [estadoVisual, setEstadoVisual] = useState("normal"); // normal | exito | error
  const rutaRef = useRef([]);
  const activoRef = useRef(false);
  const contenedorRef = useRef(null);

  // El panResponder se memoiza (no debe recrearse en cada render para no
  // perder el gesto en curso), así que las callbacks se leen desde un ref
  // que siempre apunta a la versión más reciente recibida por props; de lo
  // contrario, tras el primer patrón dibujado, el componente padre vuelve a
  // renderizar con un onPatronCompleto nuevo (closure con el estado
  // actualizado) pero el panResponder memoizado seguiría llamando siempre a
  // la versión vieja (closure con el estado del primer render).
  const onPatronCompletoRef = useRef(onPatronCompleto);
  const onPatronIncompletoRef = useRef(onPatronIncompleto);
  useEffect(() => {
    onPatronCompletoRef.current = onPatronCompleto;
    onPatronIncompletoRef.current = onPatronIncompleto;
  }, [onPatronCompleto, onPatronIncompleto]);

  // locationX/locationY de los eventos táctiles no son confiables durante el
  // arrastre (a veces reportan coordenadas de otra vista), así que medimos la
  // posición absoluta del contenedor en pantalla y trabajamos con
  // pageX/pageY (grant) y moveX/moveY (move), que sí son consistentes.
  function manejarLayout() {
    requestAnimationFrame(() => {
      contenedorRef.current?.measureInWindow((x, y, width, height) => {
        setLayout({ x, y, width, height });
      });
    });
  }

  const radioPunto = size * 0.06;
  const radioAcierto = size * 0.12;

  const puntos = useMemo(() => {
    if (!layout) return [];
    const { width, height } = layout;
    const lista = [];
    for (let fila = 0; fila < FILAS_COLUMNAS; fila++) {
      for (let columna = 0; columna < FILAS_COLUMNAS; columna++) {
        const indice = fila * FILAS_COLUMNAS + columna;
        lista.push({
          indice,
          x: ((columna + 0.5) * width) / FILAS_COLUMNAS,
          y: ((fila + 0.5) * height) / FILAS_COLUMNAS
        });
      }
    }
    return lista;
  }, [layout]);

  function limpiar() {
    rutaRef.current = [];
    setRuta([]);
    setEstadoVisual("normal");
  }

  function marcarEstado(estado) {
    setEstadoVisual(estado);
    setTimeout(limpiar, estado === "error" ? 500 : 250);
  }

  useImperativeHandle(ref, () => ({ limpiar, marcarEstado }));

  function puntoMasCercano(x, y) {
    for (const punto of puntos) {
      const dx = punto.x - x;
      const dy = punto.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= radioAcierto) return punto;
    }
    return null;
  }

  function agregarPunto(x, y) {
    const punto = puntoMasCercano(x, y);
    if (!punto) return;
    if (rutaRef.current.some((p) => p.indice === punto.indice)) return;

    rutaRef.current = [...rutaRef.current, punto];
    setRuta(rutaRef.current);
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evento) => {
          if (!layout) return;
          activoRef.current = true;
          setEstadoVisual("normal");
          rutaRef.current = [];
          setRuta([]);
          const { pageX, pageY } = evento.nativeEvent;
          agregarPunto(pageX - layout.x, pageY - layout.y);
        },
        onPanResponderMove: (evento, gestureState) => {
          if (!activoRef.current || !layout) return;
          agregarPunto(gestureState.moveX - layout.x, gestureState.moveY - layout.y);
        },
        onPanResponderRelease: () => {
          activoRef.current = false;
          const indices = rutaRef.current.map((p) => p.indice);
          if (indices.length === 0) return;

          if (indices.length < 2) {
            onPatronIncompletoRef.current && onPatronIncompletoRef.current();
            limpiar();
            return;
          }

          onPatronCompletoRef.current && onPatronCompletoRef.current(indices);
        }
      }),
    [disabled, puntos, layout]
  );

  const colorPunto =
    estadoVisual === "exito" ? "#2e7d32" : estadoVisual === "error" ? "#c62828" : "#1565c0";

  return (
    <View
      ref={contenedorRef}
      style={{ width: size, height: size }}
      onLayout={manejarLayout}
      {...panResponder.panHandlers}
    >
      {ruta.slice(1).map((punto, i) => {
        const anterior = ruta[i];
        const dx = punto.x - anterior.x;
        const dy = punto.y - anterior.y;
        const largo = Math.sqrt(dx * dx + dy * dy);
        const angulo = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={`linea-${anterior.indice}-${punto.indice}`}
            style={{
              position: "absolute",
              left: anterior.x,
              top: anterior.y - 2,
              width: largo,
              height: 4,
              backgroundColor: colorPunto,
              borderRadius: 2,
              transform: [{ rotate: `${angulo}deg` }],
              transformOrigin: "left center"
            }}
          />
        );
      })}

      {puntos.map((punto) => {
        const seleccionado = ruta.some((p) => p.indice === punto.indice);
        return (
          <View
            key={punto.indice}
            style={[
              styles.punto,
              {
                left: punto.x - radioPunto,
                top: punto.y - radioPunto,
                width: radioPunto * 2,
                height: radioPunto * 2,
                borderRadius: radioPunto,
                borderColor: colorPunto,
                backgroundColor: seleccionado ? colorPunto : "white"
              }
            ]}
          />
        );
      })}
    </View>
  );
});

export default PatronLock;

const styles = StyleSheet.create({
  punto: {
    position: "absolute",
    borderWidth: 2
  }
});
