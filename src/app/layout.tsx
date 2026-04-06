import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorCatcher } from "@/components/GlobalErrorCatcher";
import "./globals.css";

const GA_ID = "G-5S3354R4FJ";

// M3 Typography: Roboto — the canonical Google / Material Design typeface
const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Roboto also used for headings (Google uses the same family with different weights)
const robotoHeading = Roboto({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Roboto Mono for technical/code data — Google's monospace companion
const robotoMono = Roboto_Mono({
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
  title: "JoIAs by Neksti – Transforme Fotos de Celular em Estúdio Profissional",
  description: "Plataforma de IA especializada em fotografia de produto para joalheria, moda e calçados. Componha cenários de luxo em segundos.",
  keywords: ["IA", "fotografia de produto", "e-commerce", "joias", "moda", "calçados", "neksti"],
  icons: {
    icon: '/logo_neksti.png',
    apple: '/logo_neksti.png',
  },
  openGraph: {
    title: "JoIAs by Neksti",
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
        {/* Preview fonts for typography selector */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda&family=Cinzel&family=Cormorant+Garamond:ital@1&family=Montserrat&family=Playfair+Display&display=swap" rel="stylesheet" />
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
      <body className={`${roboto.variable} ${robotoHeading.variable} ${robotoMono.variable} antialiased h-full`}>
        <ErrorBoundary>
          <GlobalErrorCatcher />
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
