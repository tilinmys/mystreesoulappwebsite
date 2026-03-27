import { AuthSessionGate } from "@/components/auth-session-gate";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSessionGate>{children}</AuthSessionGate>;
}
