import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#0a0a1a] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
