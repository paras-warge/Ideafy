import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getVideoDetails } from "../api/youtubeApi";
import HistoryIcon from "../icons/history.svg";
import InfoIcon from "../icons/info.svg";
import SpinIcon from "../icons/Spinnerlogo.svg";

const SPIN_SIZE = 200;

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [url, setUrl] = useState("");
  const [formats, setFormats] = useState([]);
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [percent, setPercent] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [tooltip, setTooltip] = useState("");

  const progressInterval = useRef(null);
  const tooltipTimer = useRef(null);

  const spin = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef(null);

  const resetToInitial = useCallback(() => {
    setFormats([]);
    setTitle("");
    setThumbnail(null);
    setPercent(0);
    setUrl("");
    setTooltip("");
    clearInterval(progressInterval.current);
    stopSpinner();
    setFetchingInfo(false);
    setDownloading(false);
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (formats.length > 0 && !fetchingInfo && !downloading) {
        resetToInitial();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [formats, fetchingInfo, downloading, resetToInitial]);

  const startSpinner = () => {
    spin.setValue(0);
    spinLoop.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.current.start();
  };

  const stopSpinner = () => {
    spinLoop.current?.stop();
  };

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const showTooltip = (message) => {
    setTooltip(message);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);

    tooltipTimer.current = setTimeout(() => {
      setTooltip("");
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, []);

  const pasteAndFetch = async () => {
    if (fetchingInfo || downloading) return;

    if (formats.length > 0) {
      resetToInitial();
      return;
    }

    const text = await Clipboard.getStringAsync();

    if (!text || text.trim().length === 0) {
      showTooltip("Copy the link then paste");
      return;
    }

    const trimmed = text.trim();
    setUrl(trimmed);
    fetchVideo(trimmed);
  };

  const fetchVideo = async (inputUrl) => {
    try {
      setFetchingInfo(true);
      setFormats([]);
      setPercent(0);
      setThumbnail(null);
      startSpinner();

      progressInterval.current = setInterval(() => {
        setPercent((prev) => (prev >= 95 ? prev : prev + 2));
      }, 120);

      const data = await getVideoDetails(inputUrl);

      clearInterval(progressInterval.current);
      setPercent(100);

      setThumbnail(data.thumbnail);
      setTitle(data.title);
      setFormats(data.formats);
    } catch (_error) {
      Alert.alert("Failed to fetch video");
      resetToInitial();
      return;
    }

    stopSpinner();
    setFetchingInfo(false);
  };



  const downloadAndSave = async (videoUrl) => {
    try {
      setDownloading(true);
      setPercent(0);
      startSpinner();

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required");
        resetToInitial();
        return;
      }

      const fileUri = FileSystem.documentDirectory + `${Date.now()}.mp4`;

      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        fileUri,
        {},
        (progress) => {
          const pct =
            (progress.totalBytesWritten /
              progress.totalBytesExpectedToWrite) *
            100;
          setPercent(Math.floor(pct));
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("IDEAFY", asset, false);

      Alert.alert("Success", "Video saved");
      resetToInitial();
    } catch (_error) {
      Alert.alert("Download failed");
      resetToInitial();
    }
  };

  const renderSpinContent = () => {
    if (tooltip) return <Text style={styles.spinText}>{tooltip}</Text>;
    if (!url && !fetchingInfo && !downloading)
      return <Text style={styles.spinText}>Tap to Paste</Text>;
    if (fetchingInfo || downloading)
      return <Text style={styles.spinPercentage}>{percent}%</Text>;
    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#212325", "#141517"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          locations={[0, 0.8]}
          style={StyleSheet.absoluteFillObject}
        />

        <Image
          source={require("../images/Starlayer.png")}
          style={styles.starlayer}
          resizeMode="cover"
          pointerEvents="none"
        />

        <View style={styles.content}>
  
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <Pressable
              onPress={() => navigation.navigate("SettingScreen")}
              style={styles.iconBtn}
            >
              <InfoIcon width={80} height={80} style={{ transform: [{ translateY:  4 }] }} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("History")}
              style={styles.iconBtn}
            >
              <HistoryIcon width={80} height={80}  style={{ transform: [{ translateY: 4 }] }} />
            </Pressable>
          </View>

          {/* Brand */}
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>IDEAFY</Text>
            <Text style={styles.brandSub}>IDEAMAGIX</Text>
          </View>

      
          <View style={styles.centerArea}>
            {formats.length === 0 && (
              <Pressable
                onPress={pasteAndFetch}
                disabled={fetchingInfo || downloading}
                style={styles.spinBox}
              >
                <Animated.View
                  style={{
                    transform: [
                      { rotate: fetchingInfo || downloading ? rotate : "0deg" },
                    ],
                  }}
                >
                  <SpinIcon width={SPIN_SIZE} height={SPIN_SIZE} />
                </Animated.View>

                <View style={styles.spinContentContainer}>
                  {renderSpinContent()}
                </View>
              </Pressable>
            )}

            {!fetchingInfo && !downloading && formats.length > 0 && (
              <View style={styles.resultCard}>
                {thumbnail && (
                  <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
                )}

                <Text style={styles.videoTitle} numberOfLines={2}>
                  {title}
                </Text>

                {formats.map((f, i) => (
                  <Pressable
                    key={i}
                    onPress={() => downloadAndSave(f.url)}
                    style={styles.qualityBtn}
                  >
                    <Text style={styles.qualityText}>
                      {f.quality} • {f.size}
                    </Text>
                    <Text style={styles.downloadText}>Download</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

    
          <View style={styles.bottom}>
            <View style={styles.dotsRow}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotMiddle]} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.mode}>VIDEO</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#141517",
  },

  container: {
    flex: 1,
  },

  starlayer: {
    position: "absolute",
    alignSelf: "center",
    top: "15%",
    width: "100%",
    height: "70%",
    opacity: 0.75,
    
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },

  topBar: {
    
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconBtn: {
    width: 39,
    height: 39,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
     backgroundColor: "rgba(255,255,255,0.06)",
    
  },


 brandBlock: {
  alignItems: "center",
  marginTop: 40,   
},

brand: {
  color: "#EDEDED",
  letterSpacing: 8,
  fontSize: 24,
  fontWeight: "500",
},

brandSub: {
  marginTop: 6,
  color: "#8d8787",
  letterSpacing: 4,
  fontSize: 12,
},


  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  spinBox: {
    width: SPIN_SIZE,
    height: SPIN_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  spinContentContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  spinText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },

  spinPercentage: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  resultCard: {
    width: "88%",
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
  },

  videoTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },

  qualityBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  qualityText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  downloadText: {
    color: "#FF9A57",
    fontSize: 13,
    fontWeight: "700",
  },

  bottom: {
    alignItems: "center",
    paddingBottom: 20,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF9A57",
  },

  dotMiddle: {
    transform: [{ translateY: -8 }],
  },

  mode: {
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 6,
    fontSize: 12,
  },
});
