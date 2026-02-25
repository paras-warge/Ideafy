import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { checkConnection } from "../utils/connectionCheck";
import { logEvent } from "../utils/ServerLogger";

export default function SplashScreen() {
  const navigation = useNavigation();
  const [blockW, setBlockW] = useState(null);
  const x = useRef(new Animated.Value(0)).current;

  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let t;

    const run = async () => {
      setOffline(false);

      
      const net = await checkConnection();
      const hasInternet =
        net.isConnected === true &&
        net.isInternetReachable !== false;

      if (!hasInternet) {
        setOffline(true);
        return; 
      }

      
      await logEvent("connection_check", net);
      await logEvent("app_open", { screen: "Splash" });

      const key = "FIRST_OPEN_DONE_V1";
      const done = await AsyncStorage.getItem(key);
      if (!done) {
        await logEvent("install_first_open", {});
        await AsyncStorage.setItem(key, "1");
      }

      t = setTimeout(() => navigation.replace("HomeScreen"), 1000);
    };

    run();

    return () => {
      if (t) clearTimeout(t);
    };
  }, [navigation]);

  
  const retry = async () => {
    setOffline(false);

    const net = await checkConnection();
    const hasInternet =
      net.isConnected === true &&
      net.isInternetReachable !== false;

    if (!hasInternet) {
      setOffline(true);
      return;
    }

    await logEvent("connection_check_retry", net);
    await logEvent("app_open_retry", { screen: "Splashscreen" });

    const t = setTimeout(() => navigation.replace("HomeScreen"), 500);
    return () => clearTimeout(t);
  };


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
        locations={[0, 0.8]}
        colors={["#212325", "#141517"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <Image
        source={require("../images/Starlayer.png")}
        style={styles.starlayer}
        resizeMode="cover"
      />

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
      </View>

      {offline && (
        <View style={styles.offlineWrap}>
          <Text style={styles.offlineTitle}>No Internet Connection</Text>
          <Text style={styles.offlineSub}>
            Turn on Wi-Fi or mobile data, then press Retry.
          </Text>

          <Pressable
            onPress={retry}
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
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
    zIndex: 2,
  },

  brandBlock: { marginTop: 78, alignItems: "center", zIndex: 5 },

  brand: {
    color: "#EDEDED",
    letterSpacing: 10,
    fontSize: 18,
    fontWeight: "500",
  },

  brandSub: { marginTop: 8, color: "#8d8787", letterSpacing: 4, fontSize: 10 },

  content: { marginTop: 62, width: "86%", alignItems: "center", zIndex: 5 },

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

  collageBlock: { paddingHorizontal: 2 },
  row: { flexDirection: "row", justifyContent: "center" },
  tile: { width: 100, height: 150, borderRadius: 16, margin: 10 },

  offlineWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 54,
    zIndex: 50,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.40)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  offlineTitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: "800",
  },

  offlineSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  retryBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  retryText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
