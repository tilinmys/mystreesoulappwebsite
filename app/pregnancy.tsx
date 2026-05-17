import { ComingSoonScreen } from "../components/system/ComingSoonScreen";

const bloopImage = require("../public/images/bloop-pregnancy.webp");

export default function PregnancyScreen() {
  return (
    <ComingSoonScreen
      title="Pregnancy"
      description="Week-by-week support, symptom tracking, and gentle nourishment guidance for every stage of your pregnancy. A companion for the most transformative journey of your life."
      icon="baby-carriage"
      iconColor="#D7A6A1"
      bloopImage={bloopImage}
      showBackButton
    />
  );
}
