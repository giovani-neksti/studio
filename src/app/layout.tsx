import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorCatcher } from "@/components/GlobalErrorCatcher";
import "./globals.css";

const GA_ID = "G-5S3354R4FJ";

// M3 Typography: Inter for body (most readable sans-serif on screens)
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Space Grotesk for headings — geometric, techy, Silicon Valley feel
const spaceGrotesk = Space_Grotesk({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// JetBrains Mono for technical/AI data display
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
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
  title: "Studio AI by Neksti – Transforme Fotos de Celular em Estúdio Profissional",
  description: "Plataforma de IA especializada em fotografia de produto para joalheria, moda e calçados. Componha cenários de luxo em segundos.",
  keywords: ["IA", "fotografia de produto", "e-commerce", "joias", "moda", "calçados", "neksti"],
  openGraph: {
    title: "Studio AI by Neksti",
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
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased h-full`}>
        <ErrorBoundary>
          <GlobalErrorCatcher />
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
