import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PWAInstallBanner />
    </>
  );
}
