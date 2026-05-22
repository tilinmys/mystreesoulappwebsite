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

export function AuraBackground({ variant, forceDark }: { variant: SystemAuraVariant; forceDark?: boolean }) {
  return <ContextualAuraBackground variant={variant} forceDark={forceDark} />;
}
