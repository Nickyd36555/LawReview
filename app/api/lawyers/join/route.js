import { redirect } from 'next/navigation';
import { createUser, getUserByEmail, createLawyerListing } from '../../../../lib/db';
import { hashPassword, setSession } from '../../../../lib/auth';

export async function POST(request) {
  const form = await request.formData();
  const get = (k) => (form.get(k) || '').toString().trim();

  const name = get('name');
  const email = get('email');
  const password = (form.get('password') || '').toString();
  const firm = get('firm');
  const city = get('city');
  const state = get('state').toUpperCase().slice(0, 2);
  const practiceArea = get('practiceArea');
  const blurb = get('blurb');
  const yearsExperience = Number(get('yearsExperience')) || 0;

  const fail = (msg) => redirect(`/for-lawyers/join?error=${encodeURIComponent(msg)}`);

  if (!name || !email || password.length < 8) {
    fail('Please fill in your account details (password must be 8+ characters).');
  }
  if (!firm || !city || state.length !== 2 || !practiceArea || !blurb) {
    fail('Please complete all listing fields.');
  }
  if (getUserByEmail(email)) {
    fail('An account with that email already exists. Try logging in.');
  }

  // TODO: real payment goes here (Stripe checkout). For now the listing is
  // activated immediately so the flow can be tested end to end.
  const user = createUser({ email, name, passwordHash: hashPassword(password), role: 'lawyer' });
  const slug = createLawyerListing({
    userId: user.id, name, firm, city, state, practiceArea, blurb, yearsExperience,
  });
  await setSession(user.id);
  redirect(`/lawyers/${slug}`);
}
