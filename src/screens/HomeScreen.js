import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen({navigation}) {

  
  const progress = useRef(new Animated.Value(0)).current;
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const DURATION = 5000;

    progress.setValue(0);

    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.linear,
        useNativeDriver: true, 
      })
    );

    loop.start();
    return () => loop.stop();
  }, [progress]);

  
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  
  const percentText = progress.interpolate({
    inputRange: [0, 0],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#212325", "#141517"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image
        source={require("../images/Starlayer.png")}
        style={styles.starlayer}
        resizeMode="cover"
      />
      <View style={styles.starOverlay} />

      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn}>
          <Image
            source={require("../images/info.png")}
            style={styles.iconImg}
            resizeMode="contain"
            
          />
        </Pressable>

        <Pressable
  style={styles.iconBtn}
  onPress={() => navigation.navigate("History")}
>
  <Image
    source={require("../images/history.png")}
    style={styles.iconImg}
    resizeMode="contain"
  />
</Pressable>

      </View>

      <View style={styles.brandBlock}>
        <Text style={styles.brand}>IDEAFY</Text>
        <Text style={styles.brandSub}>IDEAMAGIX</Text>
      </View>

      <View style={styles.centerArea}>
        <View style={styles.spinBox}>
          <Animated.View
            style={[styles.spinRotateWrap, { transform: [{ rotate }] }]}
          >
            <Image
              source={require("../images/spin.png")}
              style={styles.spinImg}
              resizeMode="contain"
            />
          </Animated.View>

          <View pointerEvents="none" style={styles.pctCenter}>
            <Animated.Text style={styles.pctText}>{percentText}</Animated.Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { opacity: 1}]} />
          <View style={[styles.dot, styles.dotMiddle, { opacity: 1 }]} />
          <View style={[styles.dot, { opacity: 1 }]} />
        </View>
      
        <Text style={styles.mode}>VIDEO</Text>
      </View>
          </View>
  );
}

const SPIN_SIZE = 200;

export const styles = StyleSheet.create({
  root: { flex: 1 },

  starlayer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 560,
    opacity: 1,
    zIndex: 1,
  },

  starOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 560,
    backgroundColor: "#141517",
    opacity: 0.28,
    zIndex: 2,
  },

  topBar: {
    marginTop: 50,
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconImg: {
    width: 90,
    height: 90,
  },

  brandBlock: {
    marginTop: 78,
    alignItems: "center",
    zIndex: 5,
  },

  brand: {
    color: "#EDEDED",
    letterSpacing: 8,
    fontSize: 26,
    fontWeight: "500",
  },

  brandSub: {
    marginTop: 8,
    color: "#8d8787",
    letterSpacing: 4,
    fontSize: 10,
  },

  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  spinBox: {
    width: SPIN_SIZE,
    height: SPIN_SIZE,
    bottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  spinRotateWrap: {
    width: SPIN_SIZE,
    height: SPIN_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  spinImg: {
    width: SPIN_SIZE + 12,
    height: SPIN_SIZE + 12,
  },

  pctCenter: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  pctText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },

   bottom: {
  position: "absolute",
  bottom: 44,
  left: 0,
  right: 0,
  alignItems: "center",
},

dotsRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 6,  
},

dot: {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: "#FF9A57",
},

dotMiddle: {
  transform: [{ translateY: -5 }], 
},

mode: {
  color: "rgba(255,255,255,0.75)",
  letterSpacing: 6,
  fontSize: 12,
}
});

