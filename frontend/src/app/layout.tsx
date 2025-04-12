"use client";

import { useEffect } from "react";
import { notificationService } from "@/services/notificationService";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationPopup from "./components/NotificationPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    notificationService.init().catch(console.error);

    return () => {
      notificationService.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <NotificationPopup />
      </body>
    </html>
  );
}
