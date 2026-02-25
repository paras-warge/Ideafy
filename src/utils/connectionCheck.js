import NetInfo from "@react-native-community/netinfo";

export async function checkConnection() {
  const state = await NetInfo.fetch();

  return {
    isConnected: !!state.isConnected,
    isInternetReachable:
      state.isInternetReachable === null ? null : !!state.isInternetReachable,
    type: state.type,
  };
}
