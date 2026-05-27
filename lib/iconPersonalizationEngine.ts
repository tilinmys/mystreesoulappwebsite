import { DASHBOARD_GRID_ICONS } from "../constants/icons";
import type { DashboardGridId } from "../types/personalization";

export function resolveDashboardIconMap(): Partial<Record<DashboardGridId, string>> {
  return DASHBOARD_GRID_ICONS;
}

export function getDashboardIcon(gridId: DashboardGridId): string | undefined {
  return DASHBOARD_GRID_ICONS[gridId];
}
