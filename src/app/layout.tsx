import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Studio AI – Gerador de Imagens de Alta Conversão",
  description: "Plataforma de geração de imagens com IA para joalheria, moda e calçados. Crie imagens profissionais que convertem em segundos.",
  keywords: ["IA", "geração de imagens", "e-commerce", "joias", "moda", "calçados", "fotografia de produto"],
  openGraph: {
    title: "Studio AI",
    description: "Imagens de alta conversão geradas por IA para seu negócio",
    type: "website",
    url: "https://studio.neksti.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        {children}
      </body>
    </html>
  );
}
