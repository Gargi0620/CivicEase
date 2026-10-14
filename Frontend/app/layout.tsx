
import type { Metadata } from "next";
import "./globals.css";
import "./schemes/schemes.css";

export const metadata: Metadata = {
  title: "CivicEase | Maharashtra",
  description:
    "Discover government schemes for women entrepreneurs in Maharashtra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
