import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { useNetworkStore } from "../store/networkStore";

export function useOfflineStatus() {
  const setOnlineStatus = useNetworkStore((state) => state.setOnlineStatus);
  const isOnline = useNetworkStore((state) => state.isOnline);
  const [listenerReady, setListenerReady] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnlineStatus(Boolean(state.isConnected && state.isInternetReachable !== false));
      setListenerReady(true);
    });
    return unsubscribe;
  }, [setOnlineStatus]);

  return { isOffline: listenerReady ? !isOnline : false, queuedLogs: 0 };
}
