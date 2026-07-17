import Link from 'next/link';
import { currentUser } from '../lib/auth';

const GRADE_COLORS = {
  A: 'linear-gradient(160deg, #2c8a55, #1d5c39)',
  B: 'linear-gradient(160deg, #6e9142, #4b662b)',
  C: 'linear-gradient(160deg, #b3903a, #7d6323)',
  D: 'linear-gradient(160deg, #b06232, #7c421f)',
  F: 'linear-gradient(160deg, #a83c33, #732722)',
};

export function GradeBadge({ grade, size = 56 }) {
  return (
    <span
      className="grade-badge"
      title={`Report card grade: ${grade}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: GRADE_COLORS[grade] || '#666',
      }}
    >
      {grade}
    </span>
  );
}

const LIGHT_LABELS = {
  green: 'Green light — OK to hire',
  yellow: 'Yellow light — proceed with caution',
  red: 'Red light — think twice',
};

export function Stoplight({ active, size = 18 }) {
  return (
    <span className="stoplight" title={LIGHT_LABELS[active]}>
      {['red', 'yellow', 'green'].map((c) => (
        <span
          key={c}
          className={`light ${c} ${active === c ? 'on' : ''}`}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}

export function StoplightLabel({ active }) {
  return <span className={`light-label ${active}`}>{LIGHT_LABELS[active]}</span>;
}

const AVATAR_HUES = [210, 340, 160, 30, 270, 190, 0, 90];

export function Avatar({ name, size = 120 }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hue = AVATAR_HUES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_HUES.length];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Photo of ${name}`}
      style={{
        borderRadius: 8,
        flexShrink: 0,
        border: '1px solid rgba(198, 163, 95, .35)',
        boxShadow: '0 10px 24px rgba(0, 0, 0, .45)',
      }}
    >
      <rect width="100" height="100" fill={`hsl(${hue}, 18%, 20%)`} />
      <circle cx="50" cy="38" r="16" fill={`hsl(${hue}, 22%, 52%)`} />
      <path d="M20 92 a30 30 0 0 1 60 0 z" fill={`hsl(${hue}, 22%, 52%)`} />
      <text x="50" y="97" textAnchor="middle" fontSize="13" fontWeight="700" fill="#dcbe7e">
        {initials}
      </text>
    </svg>
  );
}

export async function Header() {
  const user = await currentUser();
  return (
    <header className="site-header">
      <Link href="/" className="logo">
        ⚖️ LawReview
      </Link>
      <nav>
        <Link href="/search">Find a Lawyer</Link>
        <Link href="/for-lawyers">For Lawyers</Link>
        {user ? (
          <>
            <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
            <form action="/api/auth/logout" method="post" style={{ display: 'inline' }}>
              <button type="submit" className="link-btn">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="cta">Sign up free</Link>
          </>
        )}
      </nav>
    </header>
  );
}
