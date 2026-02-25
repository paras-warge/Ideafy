import { View, useWindowDimensions } from "react-native";

export default function AppFrame({ children }) {
  const { width, height } = useWindowDimensions();
  const targetRatio = 9 / 16;

  const frameWidth = Math.min(width, height * targetRatio);
  const frameHeight = frameWidth / targetRatio;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black", 
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: frameWidth,
          height: frameHeight,
          backgroundColor: "#141517",
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </View>
    </View>
  );
}
