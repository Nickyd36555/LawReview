import { redirect } from 'next/navigation';
import { createUser, getUserByEmail } from '../../../../lib/db';
import { hashPassword, setSession } from '../../../../lib/auth';

export async function POST(request) {
  const form = await request.formData();
  const name = (form.get('name') || '').toString().trim();
  const email = (form.get('email') || '').toString().trim();
  const password = (form.get('password') || '').toString();
  const next = (form.get('next') || '/').toString();
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (!name || !email || password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent('Please fill in all fields (password must be 8+ characters).')}`);
  }
  if (getUserByEmail(email)) {
    redirect(`/signup?error=${encodeURIComponent('An account with that email already exists. Try logging in.')}`);
  }

  const user = createUser({ email, name, passwordHash: hashPassword(password) });
  await setSession(user.id);
  redirect(safeNext);
}
