import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ByggeTalent",
  description:
    "Diskret rekruttering og karrieremuligheder i bygge- og anlægsbranchen.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body>
        <style>{`input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.65) !important; }`}</style>
        {children}
      </body>
    </html>
  );
}