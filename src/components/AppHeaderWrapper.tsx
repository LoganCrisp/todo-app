"use client";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/AppHeader";

export default function AppHeaderWrapper() {
  const pathname = usePathname();
  // Hide the header only on /auth
  if (pathname === "/auth") return null;
  return <AppHeader />;
}
