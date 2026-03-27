import { AuthSessionGate } from "@/components/auth-session-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSessionGate>{children}</AuthSessionGate>;
}
