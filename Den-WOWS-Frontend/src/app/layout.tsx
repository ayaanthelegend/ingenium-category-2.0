import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Wolves of Wall Street",
  description: "Ateeb Sohail x Fakhar Zaman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: 'url("/bg.png")'
        }}
        className={`${poppins.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
