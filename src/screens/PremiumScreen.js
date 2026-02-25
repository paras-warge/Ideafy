import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CloseIcon from "../icons/close.svg";

export default function PremiumScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("yearly");

  const PLANS = useMemo(
    () => [
      {
        id: "yearly",
        title: "YEARLY PLAN",
        priceLine: "₹ 1,299.00 per year",
        ctaPrice: "₹ 1,299",
        badge: "85% SALE",
      },
      {
        id: "weekly",
        title: "WEEKLY PLAN",
        priceLine: "₹ 199.00 per week",
        ctaPrice: "₹ 199",
      },
      {
        id: "monthly",
        title: "MONTHLY PLAN",
        priceLine: "₹ 299.00 per month",
        ctaPrice: "₹ 299",
      },
    ],
    []
  );

  const selectedPlan = PLANS.find((p) => p.id === selected) || PLANS[0];

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
              <CloseIcon width={80} height={80} style={{ transform: [{ translateY:  4 }] }}/>
            </Pressable>
          </View>

          
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandBlock}>
              <Text style={styles.brand}>IDEAFY</Text>
              <Text style={styles.brandSub}>IDEAMAGIX</Text>
            </View>

            <Text style={styles.title}>Unlock Premium</Text>

            <View style={styles.benefits}>
              <Benefit text="Unlimited Reposts" />
              <Benefit text="Ad-Free Experience" />
              <Benefit text="High-Speed Access" />
            </View>

            <View style={styles.plans}>
              {PLANS.map((p) => {
                const active = selected === p.id;

                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelected(p.id)}
                    style={[
                      styles.planCard,
                      active && styles.planCardActive,
                    ]}
                  >
                    {p.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{p.badge}</Text>
                      </View>
                    )}

                    <View style={styles.planLeft}>
                      <Text style={styles.planTitle}>{p.title}</Text>
                      <Text style={styles.planPrice}>{p.priceLine}</Text>
                    </View>

                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.bottomSection}>
            <Pressable style={styles.ctaBtn}>
              <Text style={styles.ctaText}>
                Subscribe for {selectedPlan.ctaPrice}
              </Text>
            </Pressable>

            <View style={styles.footer}>
              <Pressable>
                <Text style={styles.footerText}>Restore</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.footerText}>Terms</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.footerText}>Privacy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Benefit({ text }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.tick}>✓</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
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
    opacity: 0.25,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  topRow: {
    flexDirection: "row",
  },

  iconBtn: {
    width: 39,
    height: 39,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  scrollContent: {
    paddingBottom: 20,
  },

 brandBlock: {
  alignItems: "center",
  marginTop: 35,   
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

  title: {
    marginTop: 35,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  benefits: {
    marginTop: 16,
    gap: 10,
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  tick: {
    color: "#A855F7",
    fontSize: 16,
    fontWeight: "900",
    width: 18,
  },

  benefitText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },

  plans: {
    marginTop: 24,
    gap: 14,
  },

  planCard: {
    height: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  planCardActive: {
    borderColor: "rgba(255,140,90,0.55)",
  },

  badge: {
    position: "absolute",
    top: -10,
    left: "50%",
    transform: [{ translateX: -30 }],
    paddingHorizontal: 12,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
  },

  planLeft: { gap: 4 },

  planTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  planPrice: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  radioActive: {
    borderColor: "#FFFFFF",
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  bottomSection: {
    paddingBottom: 20,
  },

  ctaBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: {
    color: "#141517",
    fontSize: 16,
    fontWeight: "800",
  },

  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "600",
  },
});
