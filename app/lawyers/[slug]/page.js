import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLawyerBySlug, getReviews, effectiveGrade } from '../../../lib/db';
import { currentUser } from '../../../lib/auth';
import { Avatar, GradeBadge, Stoplight, StoplightLabel } from '../../../components/ui';

export const dynamic = 'force-dynamic';

function Stars({ n }) {
  return <span className="stars">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

export default async function LawyerPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const lawyer = getLawyerBySlug(slug);
  if (!lawyer) notFound();

  const reviews = getReviews(lawyer.id);
  const user = await currentUser();
  const grade = effectiveGrade(lawyer);

  return (
    <>
      {/* Photo on the left, blurb in the middle, grade + stoplight on the right */}
      <div className="profile-top">
        <Avatar name={lawyer.name} size={150} />
        <div className="about">
          <h1>{lawyer.name}</h1>
          <div className="meta">
            {lawyer.practice_area} · {lawyer.firm} · {lawyer.city}, {lawyer.state} ·{' '}
            {lawyer.years_experience} years experience
          </div>
          <p>{lawyer.blurb}</p>
        </div>
        <div className="scorecard">
          <div className="caption">Report Card</div>
          <GradeBadge grade={grade} size={72} />
          {lawyer.review_count > 0 && (
            <div className="caption">
              from {lawyer.review_count} client review{lawyer.review_count === 1 ? '' : 's'}
            </div>
          )}
          <div className="caption" style={{ marginTop: 8 }}>Bottom Line</div>
          <Stoplight active={lawyer.stoplight} />
          <StoplightLabel active={lawyer.stoplight} />
        </div>
      </div>

      {/* Client reviews underneath */}
      <section className="reviews-section">
        <h2>Client Reviews ({reviews.length})</h2>

        {query.reviewed && (
          <div className="notice-banner">Thanks — your review has been posted.</div>
        )}

        {reviews.length === 0 && (
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
            No reviews yet. Be the first to review {lawyer.name}.
          </p>
        )}

        {reviews.map((r) => (
          <div className="review" key={r.id}>
            <Stars n={r.rating} /> <strong>{r.title}</strong>
            <p>{r.body}</p>
            <div className="who">
              — {r.reviewer_name}, {r.created_at.slice(0, 10)}
            </div>
          </div>
        ))}

        {user ? (
          <div className="form-card wide" style={{ marginTop: 24 }}>
            <h2>Write a review</h2>
            <form action="/api/reviews" method="post">
              <input type="hidden" name="lawyerSlug" value={lawyer.slug} />
              <label htmlFor="rating">Your rating</label>
              <select id="rating" name="rating" required defaultValue="5">
                <option value="5">★★★★★ — Excellent</option>
                <option value="4">★★★★☆ — Good</option>
                <option value="3">★★★☆☆ — Average</option>
                <option value="2">★★☆☆☆ — Poor</option>
                <option value="1">★☆☆☆☆ — Terrible</option>
              </select>
              <label htmlFor="title">Title</label>
              <input id="title" name="title" required maxLength={100} placeholder="Sum it up in a sentence" />
              <label htmlFor="body">Your experience</label>
              <textarea id="body" name="body" required rows={5} maxLength={4000} placeholder="What was it like working with this lawyer?" />
              <button type="submit">Post review</button>
              <p className="fine">
                Reviews are free and public. One review per lawyer — posting again updates your earlier review.
              </p>
            </form>
          </div>
        ) : (
          <p style={{ marginTop: 20 }}>
            <Link href={`/signup?next=/lawyers/${lawyer.slug}`}>Create a free account</Link> or{' '}
            <Link href={`/login?next=/lawyers/${lawyer.slug}`}>log in</Link> to leave a review.
          </p>
        )}
      </section>
    </>
  );
}
