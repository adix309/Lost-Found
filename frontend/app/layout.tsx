import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import bsMessages from "@/messages/bs.json";
import "./globals.css";

export const metadata: Metadata = {
  title: bsMessages.app.metadataTitle,
  description: bsMessages.app.metadataDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800&f[]=satoshi@300,400,500,700,900"
          rel="stylesheet"
        />
      </head>
      <body className="app-body">
        <Providers>
          <I18nProvider>{children}</I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
