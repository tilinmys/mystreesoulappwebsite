import { ComingSoonScreen } from "../../components/system/ComingSoonScreen";

const bloopImage = require("../../public/images/bloop-insight.webp");

export default function InsightsScreen() {
  return (
    <ComingSoonScreen
      title="AI Insights"
      description="Bloop is learning your patterns. Soon she'll surface personalised insights about your mood, sleep, and cycle — like a knowing best friend who has read all the research."
      icon="lightbulb-on-outline"
      iconColor="#F4A261"
      bloopImage={bloopImage}
    />
  );
}
