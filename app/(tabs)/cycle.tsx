import { ComingSoonScreen } from "../../components/system/ComingSoonScreen";

const bloopImage = require("../../public/images/bloop-cycle.webp");

export default function CycleScreen() {
  return (
    <ComingSoonScreen
      title="Cycle Tracking"
      description="Your personalised cycle view is almost ready. Log your flow, predict your phases, and understand your rhythms — all in one gentle space."
      icon="chart-timeline-variant-shimmer"
      iconColor="#E07A5F"
      bloopImage={bloopImage}
    />
  );
}
