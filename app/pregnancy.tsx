import { ComingSoonScreen } from "../components/system/ComingSoonScreen";

const bloopImage = require("../public/images/bloop-pregnancy.webp");

export default function PregnancyScreen() {
  return (
    <ComingSoonScreen
      title="Pregnancy"
      description="Pregnancy support is planned for V2, so the current app can stay focused on cycle care, emotional wellness, and daily support."
      icon="baby-carriage"
      iconColor="#D7A6A1"
      bloopImage={bloopImage}
      showBackButton
    />
  );
}
