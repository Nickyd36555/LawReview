import Link from 'next/link';
import { searchLawyers, effectiveGrade } from '../../lib/db';
import { Avatar, GradeBadge, Stoplight } from '../../components/ui';
import SearchBar from '../../components/SearchBar';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    location: params.location || '',
    minGrade: params.minGrade || '',
    stoplight: params.stoplight || '',
  };
  const results = searchLawyers(filters);

  return (
    <>
      <h1 style={{ color: 'var(--brand)', marginBottom: 16 }}>Find a Lawyer</h1>
      <SearchBar defaults={filters} />
      <p style={{ marginTop: 20, color: 'var(--muted)' }}>
        {results.length} lawyer{results.length === 1 ? '' : 's'} found
        {filters.location ? ` near “${filters.location}”` : ''}
      </p>
      <div className="results-grid">
        {results.map((l) => (
          <Link key={l.id} href={`/lawyers/${l.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            <div className="lawyer-card">
              <Avatar name={l.name} size={84} />
              <div className="info">
                <h3>{l.name}</h3>
                <div className="meta">
                  {l.practice_area} · {l.firm} · {l.city}, {l.state}
                </div>
                <div className="meta">
                  {l.review_count > 0
                    ? `${l.review_count} client review${l.review_count === 1 ? '' : 's'}`
                    : 'No client reviews yet'}
                </div>
              </div>
              <div className="ratings">
                <GradeBadge grade={effectiveGrade(l)} size={48} />
                <Stoplight active={l.stoplight} size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {results.length === 0 && (
        <p style={{ marginTop: 24 }}>
          No lawyers matched your search. Try a broader location or lower the grade filter.
        </p>
      )}
    </>
  );
}
