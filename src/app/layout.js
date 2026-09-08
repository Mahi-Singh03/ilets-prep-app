import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/src/app/components/ui/navbar"
import Providers from "@/src/app/components/additionals/providers";
import SEOSchema from "@/src/app/components/additionals/seoSchema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ - IELTS ਪ੍ਰੈਕਟਿਸ ਅਤੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਲਈ ਸਹਿਯੋਗੀ ਪਲੇਟਫਾਰਮ ",
  description: "ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ - IELTS ਪ੍ਰੈਕਟਿਸ ਅਤੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਲਈ ਸਹਿਯੋਗੀ ਪਲੇਟਫਾਰਮ. ਇੱਕ ਸਹਿਯੋਗੀ ਕੋਡ ਐਡੀਟਰ ਜੋ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਬਣਾਇਆ ਗਿਆ ਹੈ ਤਾਂ ਜੋ ਉਹ ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਇਕੱਠੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਅਤੇ ਅਭਿਆਸ ਕਰਨ.",
  keywords: "code editor, collaborative coding, students, real-time code sharing, coding practice",
  authors: [{ name: "Codership AI" }],
  creator: "Codership AI",
  icons: {
    icon: "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico",
    shortcut: "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico",
    apple: "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico",
  },
  openGraph: {
    title: "ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ - IELTS ਪ੍ਰੈਕਟਿਸ ਅਤੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਲਈ ਸਹਿਯੋਗੀ ਪਲੇਟਫਾਰਮ ",
    description: "ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ - IELTS ਪ੍ਰੈਕਟਿਸ ਅਤੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਲਈ ਸਹਿਯੋਗੀ ਪਲੇਟਫਾਰਮ. ਇੱਕ ਸਹਿਯੋਗੀ ਕੋਡ ਐਡੀਟਰ ਜੋ ਵਿਦਯਆਰਥੀਆਂ ਲਈ ਬਣਾਇਆ ਗਿਆ ਹੈ ਤਾਂ ਜੋ ਉਹ ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਇਕੱਠੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਅતੇ ਅભਿਆਸ ਕਰਨ.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico",
        width: 32,
        height: 32,
        alt: "Codership AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ਅੰਗਰੇਜ਼ੀ ਸਿੱਖੋ - IELTS ਪ੍ਰੈਕਟਿਸ ਅਤੇ ਕੋਡਿੰਗ ਸਿੱਖਣ ਲਈ ਸਹਿਯੋਗੀ ਪਲੇਟਫਾਰਮ ",
    description: "A collaborative code editor built for students to learn and practice coding together in real-time.",
    images: ["https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico"],
  },
};

export const viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

// Inline theme initialization script to prevent flash of unstyled content
const themeInitScript = `
(function() {
  const COLOR_THEME_KEY = 'app-color-theme';
  const FALLBACK = 'jobAppRuby';
  const root = document.documentElement;
  
  try {
    const stored = localStorage.getItem(COLOR_THEME_KEY) || FALLBACK;
    root.dataset.colorTheme = stored;
  } catch (e) {
    root.dataset.colorTheme = FALLBACK;
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <SEOSchema />
        {/* Theme initialization - runs before page render */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
