import { ComingSoonScreen } from "../components/system/ComingSoonScreen";

const bloopImage = require("../public/images/bloop-calm.webp");

export default function MenopauseScreen() {
  return (
    <ComingSoonScreen
      title="Menopause"
      description="Cooling rituals, hormone nutrition, and sleep recovery guidance for navigating this transition with confidence. You are not alone in this."
      icon="sun-wireless-outline"
      iconColor="#F4A261"
      bloopImage={bloopImage}
      showBackButton
    />
  );
}
