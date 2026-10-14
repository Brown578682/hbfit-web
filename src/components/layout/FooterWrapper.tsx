"use client";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

const APP_ROUTE_PREFIXES = ["/coach", "/dashboard", "/admin", "/onboarding", "/set-password", "/kiosk", "/login"];

export function FooterWrapper() {
  const pathname = usePathname();
  if (APP_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  return <Footer />;
}
