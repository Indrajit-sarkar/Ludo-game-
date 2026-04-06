import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Ludo Arena — Multiplayer 3D Ludo Game",
  description:
    "Play Ludo online with friends! A stunning 3D multiplayer Ludo game with real-time gameplay, animated dice rolls, and beautiful visuals. Create a room, share the code, and play!",
  keywords: ["ludo", "board game", "multiplayer", "3D", "online game"],
  openGraph: {
    title: "Ludo Arena — Play Ludo Online",
    description: "The classic board game, reimagined in 3D. Play with friends online!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
