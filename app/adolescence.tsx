import { ComingSoonScreen } from "../components/system/ComingSoonScreen";

const bloopImage = require("../public/images/bloop-learning-private.webp");

export default function AdolescenceScreen() {
  return (
    <ComingSoonScreen
      title="Teen Space"
      description="A safe, judgement-free space to understand your body as it changes. Bloop is here to answer questions you might feel too shy to ask anyone else."
      icon="school-outline"
      iconColor="#BDB2FF"
      bloopImage={bloopImage}
      showBackButton
      pillLabel="Coming Soon"
    />
  );
}
