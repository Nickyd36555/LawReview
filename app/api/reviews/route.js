import { redirect } from 'next/navigation';
import { addReview, getLawyerBySlug, CATEGORIES } from '../../../lib/db';
import { currentUser } from '../../../lib/auth';

export async function POST(request) {
  const form = await request.formData();
  const slug = (form.get('lawyerSlug') || '').toString();
  const title = (form.get('title') || '').toString().trim().slice(0, 100);
  const body = (form.get('body') || '').toString().trim().slice(0, 4000);

  const ratings = {};
  let ratingsValid = true;
  for (const c of CATEGORIES) {
    const v = Number(form.get(`rating_${c.key}`));
    if (!Number.isInteger(v) || v < 1 || v > 5) ratingsValid = false;
    ratings[c.key] = v;
  }

  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/lawyers/${slug}`)}`);

  const lawyer = getLawyerBySlug(slug);
  if (!lawyer) redirect('/search');
  if (!ratingsValid || !title || !body) {
    redirect(`/lawyers/${slug}`);
  }

  const result = addReview({ lawyerId: lawyer.id, userId: user.id, ratings, title, body });
  if (!result.ok) {
    redirect(`/lawyers/${slug}?error=${encodeURIComponent('Your review is locked now that the lawyer has responded — use the rebuttal box under their response instead.')}`);
  }
  redirect(`/lawyers/${slug}?reviewed=1`);
}
