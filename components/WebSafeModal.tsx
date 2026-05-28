/**
 * WebSafeModal
 *
 * WHY: React Native Modal on web renders into a document-level portal,
 * escaping the 390px app container and covering the entire browser viewport.
 *
 * FIX: On web, render an absolutely-positioned View instead. Because it lives
 * inside the normal React tree (inside the 390px sceneStyle container), it is
 * naturally constrained to the app frame. On native, the real Modal is used
 * with full behaviour preserved.
 */
import { Platform, Modal, View, StyleSheet } from "react-native";
import type { ReactNode } from "react";

type Props = {
  visible: boolean;
  transparent?: boolean;
  animationType?: "none" | "slide" | "fade";
  statusBarTranslucent?: boolean;
  onRequestClose?: () => void;
  children: ReactNode;
};

export function WebSafeModal({
  visible,
  transparent,
  animationType,
  statusBarTranslucent,
  onRequestClose,
  children,
}: Props) {
  if (Platform.OS !== "web") {
    return (
      <Modal
        visible={visible}
        transparent={transparent ?? true}
        animationType={animationType ?? "none"}
        statusBarTranslucent={statusBarTranslucent}
        onRequestClose={onRequestClose}
      >
        {children}
      </Modal>
    );
  }

  // Web: absolute overlay contained within the 390px scene frame
  if (!visible) return null;

  return (
    <View style={overlay} pointerEvents="box-none">
      {children}
    </View>
  );
}

const overlay = {
  ...StyleSheet.absoluteFillObject,
  zIndex: 9999,
} as const;
