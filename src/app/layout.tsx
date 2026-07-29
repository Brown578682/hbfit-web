import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Montserrat, Lora } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['400', '600', '700', '800'] })
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', weight: ['400', '600', '700'] })

const SITE_URL = 'https://honorboundfit.com'
const OG_IMAGE = `${SITE_URL}/images/Gym-Hero.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Honor Bound FIT | Veteran-Owned Gym in Fredericksburg, VA',
    template: '%s | Honor Bound FIT',
  },
  description:
    'Honor Bound FIT is a veteran-owned strength and conditioning gym in Fredericksburg, VA. Month-to-month memberships, small group training, personal training, and rucking. Guardian Angel Program for veterans, first responders, and clergy.',
  keywords: [
    'gym Fredericksburg VA', 'veteran owned gym', 'strength and conditioning Fredericksburg',
    'personal training Fredericksburg Virginia', 'small group training', 'rucking Fredericksburg',
    'fitness center Spotsylvania', 'Honor Bound FIT', 'military gym', 'first responder gym discount',
    'Guardian Angel Program gym', 'no contract gym Virginia', 'functional fitness Fredericksburg',
  ],
  authors: [{ name: 'Honor Bound FIT' }],
  creator: 'Honor Bound FIT',
  publisher: 'Honor Bound FIT',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Honor Bound FIT',
    title: 'Honor Bound FIT | Veteran-Owned Gym in Fredericksburg, VA',
    description:
      'Veteran-owned strength & conditioning in Fredericksburg, VA. Month-to-month memberships. Guardian Angel Program for vets, first responders & clergy.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Honor Bound FIT gym floor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honor Bound FIT | Veteran-Owned Gym in Fredericksburg, VA',
    description: 'Veteran-owned strength & conditioning. No contracts. Guardian Angel Program for vets & first responders.',
    images: [OG_IMAGE],
  },
  alternates: { canonical: SITE_URL },
  manifest: '/manifest.json',
  themeColor: '#000000',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: {
    // google: 'ADD_GOOGLE_SEARCH_CONSOLE_TOKEN_HERE',
  },
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['GymOrHealthClub', 'LocalBusiness'],
      '@id': `${SITE_URL}/#gym`,
      name: 'Honor Bound FIT',
      alternateName: 'HBF',
      url: SITE_URL,
      telephone: '+15407378337',
      description:
        'Veteran-owned strength and conditioning facility in Fredericksburg, VA offering small group training, personal training, rucking, and the Guardian Angel Program discount for veterans, active duty, first responders, medical students, and clergy.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '45 Centreport Pkwy, Suite 137',
        addressLocality: 'Fredericksburg',
        addressRegion: 'VA',
        postalCode: '22406',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 38.3955699,
        longitude: -77.4396841,
      },
      hasMap: 'https://maps.app.goo.gl/QRKu8SXYB48qPbB67',
      image: OG_IMAGE,
      logo: `${SITE_URL}/images/Honor-Bound-FIT-logo-med.png`,
      priceRange: '$$',
      currenciesAccepted: 'USD',
      paymentAccepted: 'Credit Card, Debit Card',
      sameAs: [
        'https://www.facebook.com/61559090918724/',
        'https://instagram.com/honorboundfit',
        'https://maps.app.goo.gl/QRKu8SXYB48qPbB67',
      ],
      founder: [
        { '@type': 'Person', name: 'Richard Brown' },
        { '@type': 'Person', name: 'Keith Linde' },
      ],
      knowsAbout: [
        'Strength Training', 'Conditioning', 'Rucking',
        'Personal Training', 'Small Group Training', 'Veteran Fitness',
      ],
      serviceArea: {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: 38.3955699, longitude: -77.4396841 },
        geoRadius: '30000',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Honor Bound FIT',
      publisher: { '@id': `${SITE_URL}/#gym` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?s={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${lora.variable}`}>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-black text-white antialiased" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
