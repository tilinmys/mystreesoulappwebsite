import { ComingSoonScreen } from "../../components/system/ComingSoonScreen";

const bloopImage = require("../../public/images/bloop-calm.webp");

export default function WellnessScreen() {
  return (
    <ComingSoonScreen
      title="Guided Healing"
      description="Breathwork, gentle movement, and restorative rituals curated for where you are in your cycle. Your healing space is being built with intention."
      icon="heart-pulse"
      iconColor="#81B29A"
      bloopImage={bloopImage}
    />
  );
}
