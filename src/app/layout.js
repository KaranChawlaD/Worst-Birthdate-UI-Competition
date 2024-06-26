import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Worst Birthdate UI",
  description: "ICS4U Project - Karan, Wasif, Eric, Justin",
};

export default function RootLayout({ children }) {
  return (
    <html className="bg-black" lang="en">
      <title>Worst Birthdate UI</title>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
