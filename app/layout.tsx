import "./globals.css";
import { ModernThemeProvider } from "./components/ModernThemeProvider";

export const metadata = {
  title: "LorDisk - Disk Space Analyzer & Cleanup Tool",
  description:
    "Cross-platform disk space analyzer with visual folder mapping and cleanup tools",
  other: {
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:;",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ModernThemeProvider>{children}</ModernThemeProvider>
      </body>
    </html>
  );
}
