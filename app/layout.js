import './globals.css';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import { Header } from '../components/ui';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const body = Source_Sans_3({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'LawReview — Lawyer report cards from real clients',
  description:
    'Search lawyers by location and grade. A–F report cards and a red/yellow/green stoplight tell you who is OK to hire.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <span className="footer-mark">⚖︎</span>
          <p>LawReview — clarity and peace of mind when it matters most.</p>
        </footer>
      </body>
    </html>
  );
}
