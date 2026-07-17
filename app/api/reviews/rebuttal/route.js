import { redirect } from 'next/navigation';
import { getReviewById, getLawyerById, addClientRebuttal } from '../../../../lib/db';
import { currentUser } from '../../../../lib/auth';

export async function POST(request) {
  const form = await request.formData();
  const reviewId = Number(form.get('reviewId'));
  const body = (form.get('body') || '').toString().trim().slice(0, 4000);

  const user = await currentUser();
  if (!user) redirect('/login');

  const review = getReviewById(reviewId);
  if (!review || !body) redirect('/search');

  const lawyer = getLawyerById(review.lawyer_id);

  // Only the review's author, only after the lawyer responded, only once —
  // enforced again inside addClientRebuttal's UPDATE guard.
  addClientRebuttal(reviewId, user.id, body);
  redirect(`/lawyers/${lawyer.slug}`);
}
