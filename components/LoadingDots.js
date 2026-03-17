import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Text } from "react-native";

const ANIMATION_DURATION = 300;

export default function LoadingDots() {
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const scale3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      scale1.setValue(0);
      scale2.setValue(0);
      scale3.setValue(0);

      Animated.sequence([
        Animated.timing(scale1, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(scale2, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        }),
        Animated.timing(scale3, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true
        })
      ]).start(() => {
        animate(); // 🔁 loop
      });
    };

    animate();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderIcon = scale => {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={{ fontSize: 24 }}>🍅</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderIcon(scale1)}
      {renderIcon(scale2)}
      {renderIcon(scale3)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  }
});
