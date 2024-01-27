import { Inter } from "next/font/google";
import "./globals.css";
import 'animate.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tido Empire Limited",
  description: "Tido Empire is fast emerging as a first-class indigenous company positioned to meet demand and offer top rate services in construction to clients locally and internationally.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
