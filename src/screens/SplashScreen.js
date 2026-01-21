import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("HomeScreen"), 3000);
    return () => clearTimeout(t);
  }, [navigation]);


  const x = useRef(new Animated.Value(0)).current;
  const [blockW, setBlockW] = useState(0);

  useEffect(() => {
    if (!blockW) return;

    const run = () => {
      x.setValue(0);
      Animated.timing(x, {
        toValue: -blockW,
        duration: 12000,
        useNativeDriver: true,
      }).start(({ finished }) => finished && run());
      
    };

    run();
    return () => x.stopAnimation();
  }, [blockW, x]);

  const imagesBlock = useMemo(
    () => (
      <View
        style={styles.collageBlock}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w && w !== blockW) setBlockW(w);
        }}
      >
        <View style={styles.row}>
          <Image source={require("../images/image1.png")} style={styles.tile} />
          <Image source={require("../images/image2.png")} style={styles.tile} />
          <Image source={require("../images/image3.png")} style={styles.tile} />
          <Image source={require("../images/image4.png")} style={styles.tile} />
          <Image source={require("../images/image5.png")} style={styles.tile} />
        </View>
        <View style={styles.row}>
          <Image source={require("../images/image6.png")} style={styles.tile} />
          <Image source={require("../images/image7.png")} style={styles.tile} />
          <Image source={require("../images/image8.png")} style={styles.tile} />
          <Image source={require("../images/image9.png")} style={styles.tile} />
          <Image source={require("../images/image10.png")} style={styles.tile} />
        </View>
      </View>
    ),
    [blockW]
  );

  return (
    <View style={styles.root}>
      
      <LinearGradient
        colors={["#212325", "#141517"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      
      <Image
        source={require("../images/Starlayer.png")}
        style={styles.starlayer}
        resizeMode="cover"
      />
      <View style={styles.starOverlay} />

      
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>IDEAFY</Text>
        <Text style={styles.brandSub}>IDEAMAGIX</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Welcome to{"\n"}Ideafy
        </Text>

        <Text style={styles.subtitle}>
          Effortlessly save, sort, and revisit all{"\n"}
          your favorite Reels, Videos, and Posts{"\n"}
          in one smooth place
        </Text>
      </View>

      
      <View pointerEvents="none" style={styles.collageArea}>
        <Animated.View
          style={[
            styles.scrollerRow,
            { transform: [{ rotate: "-14deg" }, { translateX: x }] },
          ]}
        >
          {imagesBlock}
          {imagesBlock}
        </Animated.View>

        <LinearGradient
          colors={["#141517", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.edgeLeft}
        />
        <LinearGradient
          colors={["#141517", "transparent"]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          style={styles.edgeRight}
        />
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden", alignItems: "center" },

  starlayer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 560,
    opacity: 1,
    zIndex: 5,
  },

  starOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 560,
    backgroundColor: "#141517",
    opacity: 0.28,
  },

  brandBlock: 
  { marginTop: 78, 
    alignItems: "center", 
    zIndex: 5 },
  
    brand: 
    { color: "#EDEDED",
       letterSpacing: 8, 
       fontSize: 18, 
       fontWeight: "500" },
  
    brandSub: 
    { marginTop: 8, 
      color: "#8d8787",
      letterSpacing: 4, 
      fontSize: 10 },

  content: 
  { marginTop: 62, 
    width: "86%", 
    alignItems: "center", 
    zIndex: 5 },
  
  title: {
    fontSize: 44,
    fontFamily: "Montserrat_800ExtraBold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 52,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#fff",
    opacity: 0.65,
    textAlign: "center",
    lineHeight: 22,
  },

  collageArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 420,
  },

  scrollerRow: {
    position: "absolute",
    left: "-45%",
    bottom: -70,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  collageBlock: 
  { paddingHorizontal: 25 },
  
  row: 
  { flexDirection: "row", 
    justifyContent: "center" },
  
  tile: 
  { width: 100, 
    height: 150, 
    borderRadius: 16, 
    margin: 10 },

  edgeLeft: 
  { position: "absolute", 
    left: 0, 
    bottom: 0, 
    width: 90, 
    height: 420 },
  
  edgeRight: 
  { position: "absolute", 
    right: 0, 
    bottom: 0, 
    width: 90, 
    height: 420 },
});
