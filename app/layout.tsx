import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaAutomat",
  description: "Instagram comment to DM automation SaaS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
