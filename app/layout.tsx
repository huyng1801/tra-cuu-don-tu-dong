import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CRM Ban Hang Ca Nhan",
  description: "CRM don gian de quan ly khach hang, don hang va van don.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const bodyClassName = `${manrope.variable} ${ibmPlexMono.variable} min-h-screen bg-background text-foreground antialiased`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={bodyClassName}>
        {children}
        <Toaster
          closeButton
          richColors
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "border border-border/60 bg-card text-card-foreground shadow-xl",
            },
          }}
        />
      </body>
    </html>
  );
}
