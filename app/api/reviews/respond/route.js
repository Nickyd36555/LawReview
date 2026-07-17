import { redirect } from 'next/navigation';
import { getReviewById, getLawyerById, addLawyerResponse } from '../../../../lib/db';
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
  // Only the lawyer who owns this profile — with an active paid listing —
  // may respond, and only once per review.
  if (!lawyer || lawyer.claimed_by !== user.id || !lawyer.subscription_active) {
    redirect(`/lawyers/${lawyer ? lawyer.slug : ''}`);
  }

  addLawyerResponse(reviewId, body);
  redirect(`/lawyers/${lawyer.slug}`);
}
