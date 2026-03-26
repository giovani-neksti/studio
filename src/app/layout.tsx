import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif_Display } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Studio AI – Transforme Fotos de Celular em Estúdio Profissional",
  description: "Plataforma de IA especializada em fotografia de produto para joalheria, moda e calçados. Componha cenários de luxo em segundos.",
  keywords: ["IA", "fotografia de produto", "e-commerce", "joias", "moda", "calçados", "material design 3"],
  openGraph: {
    title: "Studio AI",
    description: "Fotos de estúdio profissionais geradas por IA a partir do seu celular.",
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
      <body className={`${notoSans.variable} ${notoSerif.variable} antialiased h-full`}>
        {children}
      </body>
    </html>
  );
}
