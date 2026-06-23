import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "12º Simpósio Premierpet",
  description:
    "Faça sua inscrição para o 12º Simpósio Premierpet. Participe presencialmente no CDI/USP ou de forma online no dia 02 de setembro.",
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
