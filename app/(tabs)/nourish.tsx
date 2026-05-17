import { ComingSoonScreen } from "../../components/system/ComingSoonScreen";

const bloopImage = require("../../public/images/bloop-nourish.webp");

export default function NourishScreen() {
  return (
    <ComingSoonScreen
      title="Nourishment"
      description="Hormone-supportive recipes, anti-inflammatory meals, and hydration guidance tailored to your cycle phase. Coming soon to nourish you from the inside out."
      icon="food-apple-outline"
      iconColor="#F4A261"
      bloopImage={bloopImage}
    />
  );
}
