import { redirect } from 'next/navigation';
import { addReview, getLawyerBySlug } from '../../../lib/db';
import { currentUser } from '../../../lib/auth';

export async function POST(request) {
  const form = await request.formData();
  const slug = (form.get('lawyerSlug') || '').toString();
  const rating = Number(form.get('rating'));
  const title = (form.get('title') || '').toString().trim().slice(0, 100);
  const body = (form.get('body') || '').toString().trim().slice(0, 4000);

  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/lawyers/${slug}`)}`);

  const lawyer = getLawyerBySlug(slug);
  if (!lawyer) redirect('/search');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !title || !body) {
    redirect(`/lawyers/${slug}`);
  }

  addReview({ lawyerId: lawyer.id, userId: user.id, rating, title, body });
  redirect(`/lawyers/${slug}?reviewed=1`);
}
