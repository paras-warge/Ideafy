import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BackIcon from "../icons/back.svg";

const HISTORY_KEY = "IDEAFY_HISTORY";

export default function HistoryScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    setData(stored ? JSON.parse(stored) : []);
  };

  const deleteItem = async () => {
    const filtered = data.filter((i) => i.id !== selected.id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    setData(filtered);
    setSelected(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.localUri }} style={styles.thumb} />

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.fileName}>
          {item.title}
        </Text>

        <View style={styles.metaLine}>
          <Text style={styles.size}>{item.quality}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>

      <Pressable style={styles.menuBtn} onPress={() => setSelected(item)}>
        <Text style={styles.menuDots}>•••</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
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

      
      <Pressable
        style={styles.smallIconBtn}
        onPress={() => navigation.goBack()}
      >
        <BackIcon width={85} height={85} />
      </Pressable>

      <View style={styles.brandBlock}>
        <Text style={styles.brand}>IDEAFY</Text>
        <Text style={styles.brandSub}>IDEAMAGIX</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottom}>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotMiddle]} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.mode}>VIDEO</Text>
      </View>

      {selected && (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelected(null)}
          />

          <View style={styles.sheet}>
            <Pressable style={styles.sheetItem} onPress={deleteItem}>
              <Image
                source={require("../images/delete.png")}
                style={styles.sheetImg}
              />
              <Text style={styles.sheetText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  starlayer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 560,
    zIndex: 2,
  },

  smallIconBtn: {
    position: "absolute",
    top: 70,
    left: 28,
    width: 36,
    height: 36,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  brandBlock: {
    marginTop: 140,
    alignItems: "center",
    zIndex: 10,
  },

  brand: {
    color: "#EDEDED",
    letterSpacing: 10,
    fontSize: 26,
    fontWeight: "500",
  },

  brandSub: {
    marginTop: 8,
    color: "#8d8787",
    letterSpacing: 4,
    fontSize: 10,
  },

  listContent: {
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: 20,
  },

  thumb: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 14,
  },

  meta: { flex: 1 },

  fileName: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  metaLine: {
    flexDirection: "row",
    gap: 16,
  },

  size: {
    color: "rgba(86,214,156,0.95)",
    fontSize: 12,
    fontWeight: "700",
  },

  date: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },

  menuBtn: {
    width: 44,
    alignItems: "flex-end",
  },

  menuDots: {
    color: "#F3C34D",
    letterSpacing: 2,
    fontSize: 16,
    fontWeight: "900",
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
    transform: [{ translateY: -10 }],
  },

  mode: {
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 6,
    fontSize: 12,
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },

  sheet: {
    margin: 20,
    borderRadius: 18,
    backgroundColor: "#121111",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  sheetImg: {
    width: 22,
    height: 22,
    marginRight: 14,
  },

  sheetText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
