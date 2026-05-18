import { ComingSoonScreen } from "../components/system/ComingSoonScreen";

const bloopImage = require("../public/images/bloop-fertility-glow.webp");

export default function FertilityScreen() {
  return (
    <ComingSoonScreen
      title="Fertility"
      description="Track ovulation, understand your fertile window, and receive personalised guidance on your journey. Built thoughtfully for every path to parenthood."
      icon="flower-outline"
      iconColor="#81B29A"
      bloopImage={bloopImage}
      showBackButton
    />
  );
}
