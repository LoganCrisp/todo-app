import type { Metadata } from "next";
import "./globals.css";
import AppHeaderWrapper from "@/components/AppHeaderWrapper";

export const metadata: Metadata = {
  title: "wutTODO",
  description: "A modern, personal, fun to-do app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#18191b] min-h-screen">
        <AppHeaderWrapper />
        {children}
      </body>
    </html>
  );
}
