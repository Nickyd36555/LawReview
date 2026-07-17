export const dynamic = 'force-dynamic';

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="form-card">
      <h1>Create your free account</h1>
      {params.error && <div className="error-banner">{params.error}</div>}
      <form action="/api/auth/signup" method="post">
        <input type="hidden" name="next" value={params.next || '/'} />
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" required maxLength={80} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required maxLength={120} />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} maxLength={128} />
        <button type="submit">Sign up</button>
        <p className="fine">
          Client accounts are always free. You can search lawyers and post reviews.
          Are you a lawyer? <a href="/for-lawyers">See lawyer plans</a>.
        </p>
      </form>
    </div>
  );
}
