import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Pakar Bimbingan Jurusan Kuliah",
  description:
    "Sistem pakar untuk membantu menentukan jurusan kuliah yang sesuai dengan minat dan bakat Anda menggunakan metode Forward Chaining dan Certainty Factor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
