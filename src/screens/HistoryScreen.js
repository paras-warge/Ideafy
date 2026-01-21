import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DATA = [
  {
    id: "1",
    name: "Video1.mp4",
    size: "4.2 MB",
    date: "16 Jan , 3:45 PM",
    thumb: require("../images/image1.png"),
  },
  {
    id: "2",
    name: "Video2.mp4",
    size: "20MB",
    date: "16 Jan , 3:45 PM",
    thumb: require("../images/image7.png"),
  },
  {
    id: "3",
    name: "Video3.mp4",
    size: "25MB",
    date: "16 Jan , 3:45 PM",
    thumb: require("../images/image10.png"),
  },
  {
    id: "4",
    name: "Video4.mp4",
    size: "30MB",
    date: "16 Jan , 3:45 PM",
    thumb: require("../images/image8.png"),
  },
];

export default function HistoryScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const closeSheet = () => setSelected(null);

  const onSave = () => {
    // TODO
    closeSheet();
  };

  const onShare = () => {
    // TODO
    closeSheet();
  };

  const onDelete = () => {
    // TODO
    closeSheet();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.thumb} style={styles.thumb} resizeMode="cover" />

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.fileName}>
          {item.name}
        </Text>

        <View style={styles.metaLine}>
          <Text style={styles.size}>{item.size}</Text>
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

      <Pressable style={styles.smallIconBtn} onPress={() => navigation.goBack()}>
        <Image
          source={require("../images/Back.png")}
          style={styles.smallIconImg}
          resizeMode="contain"
        />
      </Pressable>

      <View style={styles.brandBlock}>
        <Text style={styles.brand}>IDEAFY</Text>
        <Text style={styles.brandSub}>IDEAMAGIX</Text>
      </View>

      <FlatList
        data={DATA}
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

      
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        
        <View style={styles.blurLayer} />

        
        <Pressable style={styles.modalBackdrop} onPress={closeSheet} />

        <View style={styles.sheet}>
          <Pressable style={styles.sheetItem} onPress={onSave}>
            <View style={[styles.sheetIcon, styles.iconPurple]}>
              <Text style={styles.iconGlyph}>⤓</Text>
            </View>
            <Text style={styles.sheetText}>Save To Gallery</Text>
          </Pressable>

          <View style={styles.sheetDivider} />

          <Pressable style={styles.sheetItem} onPress={onShare}>
            <View style={[styles.sheetIcon, styles.iconBlue]}>
              <Text style={styles.iconGlyph}>⤴</Text>
            </View>
            <Text style={styles.sheetText}>Share</Text>
          </Pressable>

          <View style={styles.sheetDivider} />

          <Pressable style={styles.sheetItem} onPress={onDelete}>
            <View style={[styles.sheetIcon, styles.iconRed]}>
              <Text style={styles.iconGlyph}>⌫</Text>
            </View>
            <Text style={styles.sheetText}>Delete</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  smallIconBtn: {
    position: "absolute",
    top: 86,
    left: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  smallIconImg: { width: 90, height: 90 },

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
    zIndex: 2,
  },

  brandBlock: {
    marginTop: 140,
    alignItems: "center",
    zIndex: 10,
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

  listContent: {
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  thumb: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: "#212325",
  },

  meta: { flex: 1 },

  fileName: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  metaLine: { flexDirection: "row", alignItems: "center", gap: 16 },

  size: {
    color: "rgba(86, 214, 156, 0.95)",
    fontSize: 12,
    fontWeight: "700",
  },

  date: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
  },

  menuBtn: {
    width: 44,
    height: 36,
    alignItems: "flex-end",
    justifyContent: "center",
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
    zIndex: 10,
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

  dotMiddle: { transform: [{ translateY: -5 }] },

  mode: {
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 6,
    fontSize: 12,
  },

  
  blurLayer: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(10,10,10,0.55)", 
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 28,
    borderRadius: 18,
    backgroundColor: "rgba(20,21,23,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
  },

  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  sheetDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginLeft: 18,
  },

  sheetIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  iconPurple: { backgroundColor: "rgba(168,85,247,0.18)" },
  iconBlue: { backgroundColor: "rgba(59,130,246,0.18)" },
  iconRed: { backgroundColor: "rgba(239,68,68,0.18)" },

  iconGlyph: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "800",
  },

  sheetText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
});
