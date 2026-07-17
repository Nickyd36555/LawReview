import { redirect } from 'next/navigation';
import { getUserByEmail } from '../../../../lib/db';
import { verifyPassword, setSession } from '../../../../lib/auth';

export async function POST(request) {
  const form = await request.formData();
  const email = (form.get('email') || '').toString().trim();
  const password = (form.get('password') || '').toString();
  const next = (form.get('next') || '/').toString();
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect(`/login?error=${encodeURIComponent('Wrong email or password.')}&next=${encodeURIComponent(safeNext)}`);
  }

  await setSession(user.id);
  redirect(safeNext);
}
