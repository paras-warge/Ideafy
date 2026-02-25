import Constants from "expo-constants";
import * as Device from "expo-device";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Dimensions, PixelRatio } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { getDeviceId } from "./deviceId";

function getAppVersion() {
  return (
    Constants.expoConfig?.version ||
    Constants.manifest2?.extra?.expoClient?.version ||
    "unknown"
  );
}

async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data?.ip || null;
  } catch {
    return null;
  }
}

export async function logEvent(eventName, payload = {}) {
  try {
    const deviceId = await getDeviceId(); 
    const ip = await getPublicIP();

    const { width, height } = Dimensions.get("window");
    const pixelRatio = PixelRatio.get();

    await addDoc(collection(db, "device_logs"), {
      eventName,
      deviceId,
      ip,
      payload,

      device: {
        modelName: Device.modelName || "unknown",
        osName: Device.osName || "unknown",
        osVersion: Device.osVersion || "unknown",
        deviceName: Device.deviceName || null,
        isDevice: Device.isDevice,
      },

      screen: { width, height, pixelRatio },

      appVersion: getAppVersion(),
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.log("logEvent failed:", e?.message);
  }
}
