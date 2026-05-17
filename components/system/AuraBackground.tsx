import { ContextualAuraBackground } from "../ContextualAuraBackground";

export type SystemAuraVariant =
  | "cycle"
  | "dashboard"
  | "insights"
  | "wellness"
  | "nourish"
  | "profile"
  | "bloop"
  | "pregnancy"
  | "teen"
  | "fertility"
  | "menopause"
  | "vault";

export function AuraBackground({ variant }: { variant: SystemAuraVariant }) {
  return <ContextualAuraBackground variant={variant} />;
}
