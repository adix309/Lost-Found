import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lost & Found | Prijava izgubljenih i pronađenih predmeta",
  description:
    "Pouzdana platforma za prijavu izgubljenih i pronađenih predmeta, sa pretragom, mapom i sigurnom verifikacijom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800&f[]=satoshi@300,400,500,700,900" rel="stylesheet" />
      </head>
      <body className="app-body">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
