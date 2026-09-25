import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Track your tasks, goals, and daily progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="clean-white"
      data-mode="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('app-theme') || 'clean-white';
                  var savedMode = localStorage.getItem('app-mode') || 'light';
                  var validThemes = ['clean-white', 'midnight', 'aurora', 'sunset', 'emerald'];
                  if (validThemes.indexOf(savedTheme) === -1) {
                    savedTheme = 'clean-white';
                  }
                  if (savedMode !== 'light' && savedMode !== 'dark') {
                    savedMode = 'light';
                  }

                  document.documentElement.dataset.theme = savedTheme;

                  if (savedTheme === 'clean-white') {
                    document.documentElement.dataset.mode = savedMode;
                    if (savedMode === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    document.documentElement.dataset.mode = 'dark';
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">

        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

