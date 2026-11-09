import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://matt.cooper-wright.com"),
  title: "Mesh Gradient Studio",
  description: "Create, shape and export richly textured mesh gradients in high resolution.",
  openGraph: {
    title: "Mesh Gradient Studio",
    description: "Create, shape and export richly textured mesh gradients in high resolution.",
    images: [{ url: "/mesh-gradient-studio/og.png", width: 1536, height: 1024, alt: "Mesh Gradient Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesh Gradient Studio",
    description: "Create, shape and export richly textured mesh gradients in high resolution.",
    images: ["/mesh-gradient-studio/og.png"],
  },
  icons: {
    icon: "/mesh-gradient-studio/favicon.svg",
    shortcut: "/mesh-gradient-studio/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
