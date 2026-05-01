import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
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
import { getVideoInfo } from "../api/videoApi";
import SpinIcon from "../icons/Spinnerlogo.svg";

const { width: SW } = Dimensions.get("window");
const SPIN_SIZE = 250;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#0E0F11",
  card:     "#16181B",
  card2:    "#1C1F23",
  border:   "rgba(255,255,255,0.08)",
  border2:  "rgba(255,255,255,0.13)",
  accent:   "#FF9A57",
  accent2:  "#FF6B35",
  muted:    "rgba(255,255,255,0.35)",
  muted2:   "rgba(255,255,255,0.18)",
  white:    "#FFFFFF",
  success:  "#06D6A0",
};

const QUALITY_COLORS = {
  "4k":"#FF6B6B","2160":"#FF6B6B",
  "1440":"#FF9A57",
  "1080":"#FFD166",
  "720":"#06D6A0",
  "480":"#4CC9F0",
  "360":"#A78BFA",
  "240":"#C4B5FD",
  "144":"#C4B5FD",
  "audio":"#A78BFA",
  "best":"#4CC9F0",
};
const qColor = (q = "") => {
  const s = q.toLowerCase();
  for (const [k, v] of Object.entries(QUALITY_COLORS)) if (s.includes(k)) return v;
  return C.muted;
};

const VALID_QUALITIES = [
  "144p","240p","360p","480p","720p","1080p","1440p","2160p","4K",
  "1080p 60fps","1440p 60fps","2160p 60fps","4K 60fps",
  "1080p HDR","4K HDR","Best","Audio Only",
];

// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Core state
  const [url,          setUrl]          = useState("");
  const [formats,      setFormats]      = useState([]);
  const [title,        setTitle]        = useState("");
  const [thumbnail,    setThumbnail]    = useState(null);
  const [duration,     setDuration]     = useState(null);
  const [uploader,     setUploader]     = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [percent,      setPercent]      = useState(0);
  const [tooltip,      setTooltip]      = useState("");

  // Modal state
  const [dlModal,      setDlModal]      = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [dlLabel,      setDlLabel]      = useState("");
  const [savedTitle,   setSavedTitle]   = useState("");

  // Refs
  const progressInterval = useRef(null);
  const tooltipTimer     = useRef(null);
  const spin             = useRef(new Animated.Value(0)).current;
  const spinLoop         = useRef(null);
  const btnAnims         = useRef({});
  const dlScale          = useRef(new Animated.Value(0.88)).current;
  const dlOpacity        = useRef(new Animated.Value(0)).current;
  const successScale     = useRef(new Animated.Value(0.72)).current;
  const successOpacity   = useRef(new Animated.Value(0)).current;
  const checkAnim        = useRef(new Animated.Value(0)).current;
  const progressAnim     = useRef(new Animated.Value(0)).current;
  const currentDownload = useRef(null);

  // ── Ask ALL permissions once on first app open ─────────────────────────────
  useEffect(() => {
    const askPermissions = async () => {
      const { status: existing } = await MediaLibrary.getPermissionsAsync();
      if (existing === "granted") return;
      await MediaLibrary.requestPermissionsAsync(false);
    };
    askPermissions();
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetToInitial = useCallback(() => {
    setFormats([]); setTitle(""); setThumbnail(null);
    setPercent(0); setUrl(""); setTooltip("");
    setDlModal(false); setDlLabel("");
    clearInterval(progressInterval.current);
    stopSpinner(); setFetchingInfo(false);
    Object.values(btnAnims.current).forEach(a => a.setValue(0));
  }, []);

  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => {
      if (successModal) { setSuccessModal(false); resetToInitial(); return true; }
      if (formats.length > 0 && !fetchingInfo && !dlModal) { resetToInitial(); return true; }
      return false;
    });
    return () => h.remove();
  }, [formats, fetchingInfo, dlModal, successModal, resetToInitial]);

  // ── Spinner ────────────────────────────────────────────────────────────────
  const startSpinner = () => {
    spin.setValue(0);
    spinLoop.current = Animated.loop(
      Animated.timing(spin, { toValue:1, duration:1200, easing:Easing.linear, useNativeDriver:true })
    );
    spinLoop.current.start();
  };
  const stopSpinner = () => spinLoop.current?.stop();
  const rotate = spin.interpolate({ inputRange:[0,1], outputRange:["0deg","360deg"] });

  // ── Tooltip ────────────────────────────────────────────────────────────────
  const showTooltip = (msg) => {
    setTooltip(msg);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setTooltip(""), 2200);
  };
  useEffect(() => () => tooltipTimer.current && clearTimeout(tooltipTimer.current), []);

  // ── Modal animations ───────────────────────────────────────────────────────
  const openDlModal = () => {
    setDlModal(true);
    dlScale.setValue(0.88); dlOpacity.setValue(0); progressAnim.setValue(0);
    Animated.parallel([
      Animated.spring(dlScale,   { toValue:1, tension:80, friction:8, useNativeDriver:true }),
      Animated.timing(dlOpacity, { toValue:1, duration:200, useNativeDriver:true }),
    ]).start();
  };
  const closeDlModal = () => {
    Animated.parallel([
      Animated.spring(dlScale,   { toValue:0.88, tension:80, friction:8, useNativeDriver:true }),
      Animated.timing(dlOpacity, { toValue:0, duration:150, useNativeDriver:true }),
    ]).start(() => setDlModal(false));
  };

  const openSuccessModal = (videoTitle) => {
    setSavedTitle(videoTitle);
    setSuccessModal(true);
    successScale.setValue(0.72); successOpacity.setValue(0); checkAnim.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale,   { toValue:1, tension:90, friction:7, useNativeDriver:true }),
        Animated.timing(successOpacity, { toValue:1, duration:200, useNativeDriver:true }),
      ]),
      Animated.spring(checkAnim, { toValue:1, tension:120, friction:6, useNativeDriver:true }),
    ]).start();
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return null;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const cleanUrlForApi = (raw) => {
    try {
      const parsed = new URL(raw.trim());
      const host = parsed.hostname.toLowerCase();
      if (host.includes("youtube.com")) {
        const v = parsed.searchParams.get("v");
        return v ? `https://www.youtube.com/watch?v=${v}` : raw.split("&")[0];
      }
      if (host.includes("youtu.be"))
        return `https://www.youtube.com/watch?v=${parsed.pathname.replace("/","")}`;
      if (["instagram.com","facebook.com","fb.watch","twitter.com","x.com"].some(d=>host.includes(d)))
        return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch (_) {}
    return raw.trim().split("&")[0];
  };

  const getAnim = (key) => {
    if (!btnAnims.current[key]) btnAnims.current[key] = new Animated.Value(0);
    return btnAnims.current[key];
  };

  const pulseBtn = (key) => {
    const a = getAnim(key);
    a.setValue(0);
    Animated.sequence([
      Animated.timing(a, { toValue:1, duration:200, easing:Easing.out(Easing.quad), useNativeDriver:false }),
      Animated.timing(a, { toValue:0.6, duration:100, useNativeDriver:false }),
    ]).start();
  };

  // ── Paste & fetch ──────────────────────────────────────────────────────────
  const pasteAndFetch = async () => {
    if (fetchingInfo || dlModal) return;
    if (formats.length > 0) { resetToInitial(); return; }
    const text = await Clipboard.getStringAsync();
    if (!text?.trim()) { showTooltip("Copy a link first"); return; }
    const cleaned = cleanUrlForApi(text.trim());
    setUrl(cleaned);
    fetchVideo(cleaned);
  };

  // ── Fetch video info ───────────────────────────────────────────────────────
  const fetchVideo = async (inputUrl) => {
    try {
      setFetchingInfo(true); setFormats([]); setPercent(0); setThumbnail(null);
      startSpinner();
      progressInterval.current = setInterval(() => setPercent(p => p >= 90 ? p : p + 3), 150);

      const data = await getVideoInfo(inputUrl);
      clearInterval(progressInterval.current);

      if (!data.success) {
        showErrorModal(data.error || "Failed to fetch video info");
        resetToInitial(); return;
      }

      setPercent(100);
      setThumbnail(data.thumbnail);
      setTitle(data.title);
      setDuration(data.duration);
      setUploader(data.uploader);

      const seen = new Set();
      const mapped = data.formats
        .filter(f => VALID_QUALITIES.includes(f.quality) || f.type === "audio" || f.type === "video")
        .filter(f => { const k=`${f.type}__${f.quality}`; if(seen.has(k))return false; seen.add(k);return true; })
        .map(f => ({
          url:      f.url,
          quality:  f.quality,
          ext:      f.ext || (f.type === "audio" ? "mp3" : "mp4"),
          type:     f.type,
          fps:      f.fps,
          recommended: f.recommended,
          is60fps:  f.is_60fps || (f.fps && f.fps >= 50),
          isHdr:    f.is_hdr || false,
          hasAudio: f.has_audio !== false,
          size:     formatBytes(f.file_size),
        }));

      if (mapped.length === 0) {
        showErrorModal("No downloadable formats found.");
        resetToInitial(); return;
      }
      setFormats(mapped);
    } catch (_) {
      showErrorModal("Could not reach the server.");
      resetToInitial(); return;
    }
    stopSpinner(); setFetchingInfo(false);
  };

  const showErrorModal = (msg) => {
    setTimeout(() => {
      const { Alert } = require("react-native");
      Alert.alert("Oops", msg);
    }, 100);
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const downloadAndSave = (format, idx) => {
    if (!format?.url) return;
    if (dlModal) return;
    const key = `${format.type}_${idx}`;
    pulseBtn(key);
    _doDownload(format, key);
  };

  const _doDownload = async (format, btnKey) => {
  const videoTitle = title;
  try {
    setDlLabel(format.type === "audio" ? "Audio" : format.quality);
    setPercent(0);
    progressAnim.setValue(0);
    openDlModal();
    startSpinner();

    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== "granted") {
      closeDlModal();
      stopSpinner();
      showErrorModal("Storage permission denied.");
      return;
    }

    const ext     = format.ext || (format.type === "audio" ? "mp3" : "mp4");
    const fileUri = FileSystem.cacheDirectory + `ideafy_${Date.now()}.${ext}`;

    const dl = FileSystem.createDownloadResumable(
      format.url,
      fileUri,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0) {
          const pct = Math.floor((totalBytesWritten / totalBytesExpectedToWrite) * 100);
          setPercent(pct);
          Animated.timing(progressAnim, {
            toValue: pct / 100,
            duration: 120,
            useNativeDriver: false,
          }).start();
        }
      }
    );

    // ✅ store download instance
    currentDownload.current = dl;

    const result = await dl.downloadAsync();
    if (!result?.uri) throw new Error("No URI");

    const asset = await MediaLibrary.createAssetAsync(result.uri);
    await MediaLibrary.createAlbumAsync("IDEAFY", asset, false);
    await FileSystem.deleteAsync(result.uri, { idempotent: true });

    currentDownload.current = null;

    if (btnKey) getAnim(btnKey).setValue(0);

    closeDlModal();
    stopSpinner();
    setTimeout(() => openSuccessModal(videoTitle), 300);

  } catch (err) {
    console.error("Download error:", err);

    currentDownload.current = null;

    if (btnKey) getAnim(btnKey).setValue(0);
    closeDlModal();
    stopSpinner();
    showErrorModal("Download failed.");
  }
};

const cancelDownload = async () => {
  try {
    if (currentDownload.current) {
      await currentDownload.current.pauseAsync();
      currentDownload.current = null;
    }
  } catch (e) {
    console.log("Cancel error:", e);
  }

  stopSpinner();
  closeDlModal();

  // ✅ DO NOT reset formats → goes back to fetched content
  setPercent(0);
};

  // ── Render helpers ─────────────────────────────────────────────────────────
  const videoFormats = formats.filter(f => f.type !== "audio");
  const audioFormats = formats.filter(f => f.type === "audio");
  const showFormats  = !fetchingInfo && !dlModal && formats.length > 0;

  const renderSpinContent = () => {
    if (tooltip) return <Text style={s.spinText}>{tooltip}</Text>;
    if (!url && !fetchingInfo && !dlModal) return <Text style={s.spinText}>Tap to Paste</Text>;
    if (fetchingInfo) return (
      <View style={{ alignItems:"center" }}>
        <Text style={s.spinPct}>{percent}%</Text>
        <Text style={s.spinSub}>Fetching</Text>
      </View>
    );
    return null;
  };

  // ── Format row ─────────────────────────────────────────────────────────────
  const renderFormatRow = (f, i, isAudio = false) => {
    const key   = `${f.type}_${i}`;
    const anim  = getAnim(key);
    const color = isAudio ? "#A78BFA" : qColor(f.quality);
    const label = isAudio
      ? (f.ext ? f.ext.toUpperCase() : "M4A")
      : f.quality.replace(" 60fps","").replace(" HDR","").trim();

    const bgInterp = anim.interpolate({ inputRange:[0,1], outputRange:["rgba(255,255,255,0)", color+"22"] });

    return (
      <View key={key}>
        {i > 0 && <View style={s.divider} />}
        <Pressable onPress={() => downloadAndSave(f, i)} disabled={dlModal} style={s.fRow}>
          <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor:bgInterp }]} />

          {/* Left */}
          <View style={s.fLeft}>
            <LinearGradient
              colors={[color+"28", color+"10"]}
              start={{x:0,y:0}} end={{x:1,y:1}}
              style={[s.qPill, { borderColor: color+"55" }]}
            >
              <Text style={[s.qPillText, { color }]}>{label}</Text>
            </LinearGradient>

            {f.is60fps && <Tag color="#FFD166" label="60fps" />}
            {f.isHdr   && <Tag color="#FF6B6B" label="HDR"  />}
            {f.recommended && !isAudio && <Tag color={C.success} label="Best" />}
            {isAudio && <Text style={s.audioSub}>Audio Only</Text>}
          </View>

          {/* Right */}
          <View style={s.fRight}>
            {f.size ? <Text style={s.sizeText}>{f.size}</Text> : null}
            <Animated.View style={[s.dlBtn, {
              backgroundColor: anim.interpolate({ inputRange:[0,1], outputRange:[color+"18", color+"44"] }),
              borderColor: anim.interpolate({ inputRange:[0,1], outputRange:[color+"44", color] }),
            }]}>
              <Text style={[s.dlArrow, { color }]}>↓</Text>
            </Animated.View>
          </View>
        </Pressable>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.root}>

        {/* Background */}
        <LinearGradient
          colors={["#1A1C1F", C.bg]}
          start={{x:0,y:0}} end={{x:0,y:1}}
          style={StyleSheet.absoluteFillObject}
        />
        <Image
          source={require("../images/Starlayer.png")}
          style={s.stars} resizeMode="cover" pointerEvents="none"
        />

        <View style={s.content}>

          {/* Brand */}
          <View style={s.brandBlock}>
            <Text style={s.brand}>IDEAFY</Text>
            <Text style={s.subbrand}>Smart Video Fetch & Download Tool</Text>
          </View>

          {/* Center */}
          <View style={s.centerArea}>

            {/* Spinner */}
            {formats.length === 0 && (
              <Pressable onPress={pasteAndFetch} disabled={fetchingInfo || dlModal} style={s.spinBox}>
                <Animated.View style={{ transform:[{ rotate: fetchingInfo ? rotate : "0deg" }] }}>
                  <SpinIcon width={SPIN_SIZE} height={SPIN_SIZE} />
                </Animated.View>
                <View style={s.spinInner}>{renderSpinContent()}</View>
              </Pressable>
            )}

            {/* ── Format list ── */}
            {showFormats && (
              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

                {/* Thumbnail card */}
                <View style={s.thumbCard}>
                  {thumbnail
                    ? <Image source={{ uri:thumbnail }} style={s.thumb} />
                    : <View style={[s.thumb, { backgroundColor:C.card2 }]} />
                  }
                  <LinearGradient
                    colors={["transparent","rgba(10,11,13,0.96)"]}
                    style={s.thumbGrad}
                  />
                  <View style={s.thumbMeta}>
                    {(uploader || duration) && (
                      <View style={s.metaRow}>
                        {uploader ? (
                          <View style={s.metaPill}>
                            <Text style={s.metaPillText} numberOfLines={1}>{uploader}</Text>
                          </View>
                        ) : null}
                        {duration ? (
                          <View style={[s.metaPill, { backgroundColor:"rgba(255,154,87,0.15)", borderColor:"rgba(255,154,87,0.3)" }]}>
                            <Text style={[s.metaPillText, { color:C.accent }]}>{duration}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                    <Text style={s.thumbTitle} numberOfLines={2}>{title}</Text>
                  </View>
                </View>

                {/* Video formats */}
                {videoFormats.length > 0 && (
                  <>
                    <SectionHeader label="VIDEO" count={videoFormats.length} />
                    <View style={s.card}>
                      {videoFormats.map((f,i) => renderFormatRow(f,i,false))}
                    </View>
                  </>
                )}

                {/* Audio formats */}
                {audioFormats.length > 0 && (
                  <>
                    <SectionHeader label="AUDIO" count={audioFormats.length} color="#A78BFA" />
                    <View style={s.card}>
                      {audioFormats.map((f,i) => renderFormatRow(f,i,true))}
                    </View>
                  </>
                )}

                <View style={{ height:40 }} />
              </ScrollView>
            )}
          </View>

          {/* Bottom */}
          <View style={s.bottom}>
            <View style={s.dots}>
              <View style={s.dot} /><View style={[s.dot,s.dotMid]} /><View style={s.dot} />
            </View>
            <Text style={s.modeText}>VIDEO</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════
            DOWNLOADING MODAL
        ═══════════════════════════════════════════════════ */}
        <Modal transparent visible={dlModal} animationType="none" statusBarTranslucent>
          <View style={s.modalOverlay}>
            <Animated.View style={[s.dlCard, { opacity:dlOpacity, transform:[{ scale:dlScale }] }]}>

              {thumbnail ? (
                <View style={s.dlThumbWrap}>
                  <Image source={{ uri:thumbnail }} style={s.dlThumb} blurRadius={2} />
                  <LinearGradient
                    colors={["rgba(22,24,27,0.3)","rgba(22,24,27,0.98)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>
              ) : (
                <LinearGradient colors={[C.card, C.card2]} style={s.dlThumbPlaceholder} />
              )}

              <View style={s.dlBody}>
                <Text style={s.dlTitle} numberOfLines={2}>{title}</Text>

                <LinearGradient
                  colors={[C.accent+"33", C.accent2+"22"]}
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={s.dlBadge}
                >
                  <Text style={s.dlBadgeIcon}>⬇</Text>
                  <Text style={s.dlBadgeText}>
                    {dlLabel === "Audio" ? "Downloading Audio" : `Downloading ${dlLabel}`}
                  </Text>
                </LinearGradient>

                <View style={s.progTrack}>
                  <Animated.View style={[s.progFill, {
                    width: progressAnim.interpolate({ inputRange:[0,1], outputRange:["0%","100%"] }),
                  }]}>
                    <LinearGradient
                      colors={[C.accent, C.accent2]}
                      start={{x:0,y:0}} end={{x:1,y:0}}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </Animated.View>
                  <Animated.View style={[s.progDot, {
                    left: progressAnim.interpolate({ inputRange:[0,1], outputRange:["0%","97%"] }),
                  }]} />
                </View>

                <View style={s.progRow}>
                  <Text style={s.progPct}>{percent}%</Text>
                  <Text style={s.progOf}>of 100%</Text>
                </View>

                <Text style={s.dlNote}>Please keep the app open…</Text>

                <Pressable
                  onPress={cancelDownload}
                  style={({ pressed }) => [s.cancelBtn, pressed && { backgroundColor: "rgba(255,107,107,0.2)" }]}
                >
                 <Text style={[s.cancelBtnText, { color: "#FF6B6B", fontWeight: "700", fontSize: 14 }]}>Cancel
                </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* ═══════════════════════════════════════════════════
            SUCCESS MODAL
        ═══════════════════════════════════════════════════ */}
        <Modal transparent visible={successModal} animationType="none" statusBarTranslucent>
          <View style={s.modalOverlay}>
            <Animated.View style={[s.sucCard, { opacity:successOpacity, transform:[{ scale:successScale }] }]}>
              <LinearGradient
                colors={["#1C1F23","#141618"]}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                colors={[C.success+"00", C.success, C.success+"00"]}
                start={{x:0,y:0}} end={{x:1,y:0}}
                style={s.sucAccentLine}
              />

              <Animated.View style={[s.checkCircle, {
                transform:[{ scale: checkAnim }],
                opacity: checkAnim,
              }]}>
                <LinearGradient
                  colors={[C.success+"33", C.success+"18"]}
                  style={s.checkCircleInner}
                >
                  <Text style={s.checkIcon}>✓</Text>
                </LinearGradient>
              </Animated.View>

              <Text style={s.sucHeading}>Saved to Gallery</Text>
              <Text style={s.sucBody} numberOfLines={3}>
                <Text style={s.sucQuote}>"{savedTitle}"</Text>
                {"\n"}saved to the{" "}
                <Text style={{ color:C.accent, fontWeight:"700" }}>IDEAFY</Text>
                {" "}album.
              </Text>

              <View style={s.sucBtns}>
                <Pressable
                  onPress={() => { setSuccessModal(false); resetToInitial(); }}
                  style={({ pressed }) => [s.sucBtn, s.sucBtnPrimary, pressed && { opacity:0.85 }]}
                >
                  <LinearGradient
                    colors={[C.accent, C.accent2]}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.sucBtnGrad}
                  >
                    <Text style={s.sucBtnTextPrimary}>Done</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

// ── Small reusable components ─────────────────────────────────────────────────

function Tag({ color, label }) {
  return (
    <View style={[tagS.wrap, { backgroundColor:color+"18", borderColor:color+"44" }]}>
      <Text style={[tagS.text, { color }]}>{label}</Text>
    </View>
  );
}
const tagS = StyleSheet.create({
  wrap: { paddingHorizontal:7, paddingVertical:3, borderRadius:6, borderWidth:1 },
  text: { fontSize:10, fontWeight:"700" },
});

function SectionHeader({ label, count, color = "rgba(255,255,255,0.3)" }) {
  return (
    <View style={shS.row}>
      <View style={[shS.line, { backgroundColor:color }]} />
      <Text style={[shS.label, { color }]}>{label}</Text>
      {count ? <View style={[shS.count, { backgroundColor:color+"22" }]}>
        <Text style={[shS.countText, { color }]}>{count}</Text>
      </View> : null}
    </View>
  );
}
const shS = StyleSheet.create({
  row:       { flexDirection:"row", alignItems:"center", gap:8, marginBottom:8, marginLeft:2 },
  line:      { width:3, height:12, borderRadius:2 },
  label:     { fontSize:10, fontWeight:"800", letterSpacing:3.5 },
  count:     { paddingHorizontal:6, paddingVertical:1, borderRadius:8 },
  countText: { fontSize:10, fontWeight:"700" },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:C.bg },
  root: { flex:1 },

  stars: { position:"absolute", alignSelf:"center", top:"15%", width:"100%", height:"70%", opacity:0.6 },

  content:    { flex:1, paddingHorizontal:20, justifyContent:"space-between" },
  topBar:     { flexDirection:"row", justifyContent:"space-between" },
  iconBtn:    { width:39, height:39, borderRadius:22, alignItems:"center", justifyContent:"center", backgroundColor:"rgba(255,255,255,0.06)" },
  brandBlock: { alignItems:"center", marginTop:34 },
  brand:      { color:"#EDEDED", letterSpacing:8, fontSize:24, fontWeight:"500" },
  subbrand:   { color:"rgba(255,255,255,0.35)", letterSpacing:3, fontSize:10, fontWeight:"400" },
  centerArea: { flex:1, alignItems:"center", justifyContent:"center" },

  spinBox:   { width:SPIN_SIZE, height:SPIN_SIZE, alignItems:"center", justifyContent:"center" },
  spinInner: { position:"absolute", alignItems:"center", justifyContent:"center" },
  spinText:  { color:"rgba(255,255,255,0.6)", fontSize:14 },
  spinPct:   { color:C.white, fontSize:22, fontWeight:"700" },
  spinSub:   { color:C.accent, fontSize:11, marginTop:2, letterSpacing:1 },

  scroll:        { width:"100%" },
  scrollContent: { paddingHorizontal:1, paddingTop:10 },

  thumbCard: {
    width:"100%", height:210, borderRadius:20, overflow:"hidden",
    marginBottom:20, borderWidth:1, borderColor:C.border2,
  },
  thumb:     { width:"100%", height:"100%" },
  thumbGrad: { position:"absolute", bottom:0, left:0, right:0, height:"70%" },
  thumbMeta: { position:"absolute", bottom:0, left:0, right:0, padding:14 },
  metaRow:   { flexDirection:"row", gap:6, marginBottom:6 },
  metaPill:  {
    paddingHorizontal:8, paddingVertical:3, borderRadius:20,
    backgroundColor:"rgba(255,255,255,0.12)", borderWidth:1, borderColor:"rgba(255,255,255,0.2)",
  },
  metaPillText: { color:"rgba(255,255,255,0.75)", fontSize:10, fontWeight:"600" },
  thumbTitle:   { color:C.white, fontSize:14, fontWeight:"800", lineHeight:20 },

  card: {
    width:"100%", borderRadius:18,
    backgroundColor:"rgba(255,255,255,0.038)",
    borderWidth:1, borderColor:C.border,
    marginBottom:18, overflow:"hidden",
  },
  divider: { height:1, backgroundColor:"rgba(255,255,255,0.05)", marginHorizontal:14 },

  fRow:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:14, paddingVertical:15, overflow:"hidden" },
  fLeft:  { flexDirection:"row", alignItems:"center", gap:7, flex:1, flexWrap:"wrap" },
  fRight: { flexDirection:"row", alignItems:"center", gap:10 },

  qPill:     { paddingHorizontal:11, paddingVertical:5, borderRadius:10, borderWidth:1 },
  qPillText: { fontSize:12, fontWeight:"800" },

  audioSub: { color:C.muted, fontSize:12 },
  sizeText: { color:C.muted2, fontSize:12 },
  dlBtn:    { width:36, height:36, borderRadius:12, borderWidth:1, alignItems:"center", justifyContent:"center" },
  dlArrow:  { fontSize:17, fontWeight:"900" },

  bottom:   { alignItems:"center", paddingBottom:22 },
  dots:     { flexDirection:"row", gap:8, marginBottom:6 },
  dot:      { width:4, height:4, borderRadius:2, backgroundColor:C.accent },
  dotMid:   { transform:[{ translateY:-8 }] },
  modeText: { color:"rgba(255,255,255,0.65)", letterSpacing:6, fontSize:12 },

  modalOverlay: {
    flex:1, backgroundColor:"rgba(0,0,0,0.78)",
    alignItems:"center", justifyContent:"center", padding:24,
  },

  dlCard: {
    width:"100%", borderRadius:26, overflow:"hidden",
    backgroundColor:C.card,
    borderWidth:1, borderColor:"rgba(255,154,87,0.2)",
    shadowColor:C.accent, shadowOffset:{width:0,height:8}, shadowOpacity:0.25, shadowRadius:20,
    elevation:20,
  },
  dlThumbWrap:        { width:"100%", height:160, overflow:"hidden" },
  dlThumb:            { width:"100%", height:"100%" },
  dlThumbPlaceholder: { width:"100%", height:100 },
  dlBody:             { padding:22, alignItems:"center" },
  dlTitle: {
    color:C.white, fontSize:15, fontWeight:"700", textAlign:"center",
    lineHeight:22, marginBottom:14,
  },
  
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    backgroundColor: "transparent",
  },

  dlBadge: {
    flexDirection:"row", alignItems:"center", gap:7,
    paddingHorizontal:18, paddingVertical:9, borderRadius:50,
    borderWidth:1, borderColor:"rgba(255,154,87,0.3)", marginBottom:20,
  },
  dlBadgeIcon: { fontSize:14 },
  dlBadgeText: { color:C.accent, fontSize:13, fontWeight:"700", letterSpacing:0.3 },

  progTrack: {
    width:"100%", height:6, borderRadius:3,
    backgroundColor:"rgba(255,255,255,0.08)", overflow:"visible", marginBottom:10, position:"relative",
  },
  progFill: { height:"100%", borderRadius:3, overflow:"hidden" },
  progDot:  {
    position:"absolute", top:-4, width:14, height:14, borderRadius:7,
    backgroundColor:C.accent, shadowColor:C.accent,
    shadowOffset:{width:0,height:0}, shadowOpacity:0.9, shadowRadius:6, elevation:8,
  },
  progRow:  { flexDirection:"row", alignItems:"center", gap:6, marginBottom:10 },
  progPct:  { color:C.white, fontSize:20, fontWeight:"800" },
  progOf:   { color:C.muted, fontSize:12 },
  dlNote:   { color:C.muted2, fontSize:11, marginTop:2 },

  sucCard: {
    width:"100%", borderRadius:26, overflow:"hidden",
    backgroundColor:C.card,
    borderWidth:1, borderColor:"rgba(6,214,160,0.2)",
    padding:28, alignItems:"center",
    shadowColor:C.success, shadowOffset:{width:0,height:8}, shadowOpacity:0.2, shadowRadius:20,
    elevation:20,
  },
  sucAccentLine: { position:"absolute", top:0, left:0, right:0, height:2 },

  checkCircle:      { marginBottom:20, marginTop:8 },
  checkCircleInner: {
    width:72, height:72, borderRadius:36,
    alignItems:"center", justifyContent:"center",
    borderWidth:1.5, borderColor:"rgba(6,214,160,0.35)",
  },
  checkIcon: { fontSize:34, color:C.success },

  sucHeading: { color:C.white, fontSize:20, fontWeight:"800", marginBottom:12, letterSpacing:0.3 },
  sucBody: {
    color:C.muted, fontSize:13, textAlign:"center", lineHeight:20, marginBottom:24,
  },
  sucQuote: { color:"rgba(255,255,255,0.75)", fontStyle:"italic" },

  sucBtns:           { width:"100%", gap:10 },
  sucBtn:            { borderRadius:50, overflow:"hidden" },
  sucBtnPrimary:     {},
  sucBtnGrad:        { paddingVertical:14, alignItems:"center", justifyContent:"center" },
  sucBtnTextPrimary: { color:C.white, fontSize:15, fontWeight:"800", letterSpacing:0.3 },
});