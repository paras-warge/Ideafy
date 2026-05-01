import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import BackIcon from "../icons/back.svg";
import PremiumBg from "../icons/premium.svg";
import PrivacyIcon from "../icons/privacy.svg";
import RateIcon from "../icons/rate.svg";
import ShareIcon from "../icons/share.svg";
import TermsIcon from "../icons/terms.svg";
import TrophyIcon from "../icons/trophy.svg";

const SETTINGS = [
  { id: "premium", label: "Premium", type: "layered" },
  { id: "rate", label: "Rate & Review Us", Icon: RateIcon },
  { id: "share", label: "Share App", Icon: ShareIcon },
  { id: "terms", label: "Terms and Conditions", Icon: TermsIcon },
  { id: "privacy", label: "Privacy Policy", Icon: PrivacyIcon },
];

export default function SettingScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
      
        <LinearGradient
          locations={[0, 0.8]}
          colors={["#212325", "#141517"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />

        <Image
          source={require("../images/Starlayer.png")}
          style={styles.starlayer}
          resizeMode="cover"
          pointerEvents="none"
        />

       
        <View style={styles.content}>
       
          <View style={[styles.topRow, { paddingTop: insets.top }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}
            >
              <BackIcon width={80} height={80} style={{ transform: [{ translateY:  4 }] }}/>
            </Pressable>
          </View>

          <View style={styles.brandBlock}>
            <Text style={styles.brand}>IDEAFY</Text>
            
          </View>

         
          <View style={styles.list}>
            {SETTINGS.map((item) => {
              const isPremium = item.id === "premium";

              const RowContent = (
                <View style={styles.left}>
                  <View style={styles.iconWrap}>
                    {item.type === "layered" ? (
                      <View style={styles.layerContainer}>
                        <PremiumBg width={28} height={28} />
                        <TrophyIcon
                          width={14}
                          height={14}
                          style={styles.innerIcon}
                        />
                      </View>
                    ) : (
                      <item.Icon width={28} height={28} />
                    )}
                  </View>

                  <Text style={styles.cardText}>{item.label}</Text>
                </View>
              );

              return (
                <Pressable
                  key={item.id}
                  onPress={
                    isPremium
                      ? () => navigation.navigate("PremiumScreen")
                      : undefined
                  }
                  style={({ pressed }) => [
                    styles.card,
                    pressed && isPremium && { opacity: 0.8 },
                  ]}
                >
                  {RowContent}
                </Pressable>
              );
            })}
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
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
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
  marginTop: 12,   
},

brand: {
  color: "#EDEDED",
  letterSpacing: 8,
  fontSize: 24,
  fontWeight: "500",
},


  list: {
    gap: 16,
  },

  card: {
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 18,
    justifyContent: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  layerContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  innerIcon: {
    position: "absolute",
  },

  cardText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
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
