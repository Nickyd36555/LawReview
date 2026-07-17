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

  const isOwner = !!user && lawyer.claimed_by === user.id && !!lawyer.subscription_active;
  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

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
        {query.error && <div className="error-banner">{query.error}</div>}

        {reviews.length === 0 && (
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
            No reviews yet. Be the first to review {lawyer.name}.
          </p>
        )}

        {reviews.map((r) => {
          const isAuthor = !!user && r.user_id === user.id;
          return (
            <div className="review" key={r.id}>
              <Stars n={r.rating} /> <strong>{r.title}</strong>
              <p>{r.body}</p>
              <div className="who">
                — {r.reviewer_name}, {r.created_at.slice(0, 10)}
              </div>

              {/* Step 2: the lawyer's one response */}
              {r.lawyer_response && (
                <div className="reply lawyer">
                  <div className="reply-label">Response from {lawyer.name}</div>
                  <p>{r.lawyer_response}</p>
                  <div className="who">{r.lawyer_response_at.slice(0, 10)}</div>
                </div>
              )}
              {isOwner && !r.lawyer_response && (
                <form action="/api/reviews/respond" method="post" className="reply-form">
                  <input type="hidden" name="reviewId" value={r.id} />
                  <label htmlFor={`respond-${r.id}`} className="reply-label">
                    Respond to this review (one response only)
                  </label>
                  <textarea
                    id={`respond-${r.id}`}
                    name="body"
                    required
                    rows={3}
                    maxLength={4000}
                    placeholder="Respond professionally — this is public and cannot be edited."
                  />
                  <button type="submit">Post response</button>
                </form>
              )}

              {/* Step 3: the client's one rebuttal, then the thread is closed */}
              {r.client_rebuttal && (
                <div className="reply rebuttal">
                  <div className="reply-label">Rebuttal from {r.reviewer_name}</div>
                  <p>{r.client_rebuttal}</p>
                  <div className="who">{r.client_rebuttal_at.slice(0, 10)}</div>
                </div>
              )}
              {isAuthor && r.lawyer_response && !r.client_rebuttal && (
                <form action="/api/reviews/rebuttal" method="post" className="reply-form">
                  <input type="hidden" name="reviewId" value={r.id} />
                  <label htmlFor={`rebuttal-${r.id}`} className="reply-label">
                    Your rebuttal (one only — this closes the conversation)
                  </label>
                  <textarea
                    id={`rebuttal-${r.id}`}
                    name="body"
                    required
                    rows={3}
                    maxLength={4000}
                    placeholder="Have the last word — one rebuttal, then this thread is closed."
                  />
                  <button type="submit">Post rebuttal</button>
                </form>
              )}
              {r.client_rebuttal && <div className="thread-closed">This conversation is closed.</div>}
            </div>
          );
        })}

        {user && !isOwner && (!myReview || !myReview.lawyer_response) ? (
          <div className="form-card wide" style={{ marginTop: 28 }}>
            <h2>{myReview ? 'Update your review' : 'Write a review'}</h2>
            <form action="/api/reviews" method="post">
              <input type="hidden" name="lawyerSlug" value={lawyer.slug} />
              <label htmlFor="rating">Your rating</label>
              <select id="rating" name="rating" required defaultValue={myReview ? String(myReview.rating) : '5'}>
                <option value="5">★★★★★ — Excellent</option>
                <option value="4">★★★★☆ — Good</option>
                <option value="3">★★★☆☆ — Average</option>
                <option value="2">★★☆☆☆ — Poor</option>
                <option value="1">★☆☆☆☆ — Terrible</option>
              </select>
              <label htmlFor="title">Title</label>
              <input id="title" name="title" required maxLength={100} placeholder="Sum it up in a sentence" defaultValue={myReview ? myReview.title : ''} />
              <label htmlFor="body">Your experience</label>
              <textarea id="body" name="body" required rows={5} maxLength={4000} placeholder="What was it like working with this lawyer?" defaultValue={myReview ? myReview.body : ''} />
              <button type="submit">{myReview ? 'Update review' : 'Post review'}</button>
              <p className="fine">
                Reviews are free and public. One review per lawyer. If the lawyer
                responds, your review locks and you get one rebuttal — then the
                conversation is closed.
              </p>
            </form>
          </div>
        ) : !user ? (
          <p style={{ marginTop: 20 }}>
            <Link href={`/signup?next=/lawyers/${lawyer.slug}`}>Create a free account</Link> or{' '}
            <Link href={`/login?next=/lawyers/${lawyer.slug}`}>log in</Link> to leave a review.
          </p>
        ) : null}
      </section>
    </>
  );
}
