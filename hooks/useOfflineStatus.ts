import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  return { isOffline, queuedLogs: isOffline ? 3 : 0 };
}
