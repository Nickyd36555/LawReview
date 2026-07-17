import './globals.css';
import { Header } from '../components/ui';

export const metadata = {
  title: 'LawReview — Lawyer report cards from real clients',
  description:
    'Search lawyers by location and grade. A–F report cards and a red/yellow/green stoplight tell you who is OK to hire.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
