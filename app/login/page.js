export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="form-card">
      <h1>Log in</h1>
      {params.error && <div className="error-banner">{params.error}</div>}
      <form action="/api/auth/login" method="post">
        <input type="hidden" name="next" value={params.next || '/'} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">Log in</button>
        <p className="fine">
          New here? <a href={`/signup${params.next ? `?next=${encodeURIComponent(params.next)}` : ''}`}>Create a free account</a>.
        </p>
      </form>
    </div>
  );
}
