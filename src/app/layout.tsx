import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascendra Workspaces",
  description: "Developer machine management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
