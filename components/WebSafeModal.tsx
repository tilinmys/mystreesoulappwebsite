/**
 * WebSafeModal
 *
 * WHY: React Native Modal on web renders into a document-level portal,
 * escaping the 390px app container and covering the entire browser viewport.
 *
 * FIX: On web, render a positioned View instead. Two modes:
 *
 *  - Default (fixedOnWeb=false): absoluteFillObject — stays inside the 390px
 *    scene container. Use this for modals that live inside the page scene
 *    (EditProfileModal, DailyLogSheet, health-records, cycle overlay, etc.)
 *
 *  - fixedOnWeb=true: position "fixed" covering the full viewport. Use this
 *    for overlays rendered OUTSIDE the scene container (e.g. FloatingTabBar's
 *    "More" sheet which lives in the tab-bar slot, not the scene).
 *
 * On native, the real Modal is always used with full behaviour preserved.
 */
import { Platform, Modal, View, StyleSheet } from "react-native";
import type { ReactNode } from "react";

type Props = {
  visible: boolean;
  transparent?: boolean;
  animationType?: "none" | "slide" | "fade";
  statusBarTranslucent?: boolean;
  onRequestClose?: () => void;
  /** Web only: use position:fixed so the overlay escapes a small parent
   *  container (e.g. tab bar slot). Default: false (absoluteFillObject). */
  fixedOnWeb?: boolean;
  children: ReactNode;
};

export function WebSafeModal({
  visible,
  transparent,
  animationType,
  statusBarTranslucent,
  onRequestClose,
  fixedOnWeb = false,
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

  // Web: overlay contained within the parent container (default) or
  // fixed to the full viewport (fixedOnWeb=true for tab-bar-level modals)
  if (!visible) return null;

  return (
    <View style={fixedOnWeb ? fixedOverlay : absoluteOverlay} pointerEvents="box-none">
      {children}
    </View>
  );
}

const absoluteOverlay = {
  ...StyleSheet.absoluteFillObject,
  zIndex: 9999,
} as const;

// position:"fixed" is valid in React Native Web and positions relative to
// the browser viewport, escaping any parent container.
const fixedOverlay = {
  position: "fixed" as any,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
} as const;
