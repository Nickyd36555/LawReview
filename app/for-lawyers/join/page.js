export const dynamic = 'force-dynamic';

export default async function JoinPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="form-card" style={{ maxWidth: 640 }}>
      <h1>List your practice</h1>
      {params.error && <div className="error-banner">{params.error}</div>}
      <form action="/api/lawyers/join" method="post">
        <h2 style={{ fontSize: '1.05rem' }}>Your account</h2>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" required maxLength={80} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required maxLength={120} />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} maxLength={128} />

        <h2 style={{ fontSize: '1.05rem', marginTop: 24 }}>Your listing</h2>
        <label htmlFor="firm">Firm name</label>
        <input id="firm" name="firm" required maxLength={120} />
        <label htmlFor="city">City</label>
        <input id="city" name="city" required maxLength={80} />
        <label htmlFor="state">State (2 letters)</label>
        <input id="state" name="state" required minLength={2} maxLength={2} style={{ textTransform: 'uppercase' }} />
        <label htmlFor="practiceArea">Primary practice area</label>
        <select id="practiceArea" name="practiceArea" required>
          <option>Family Law</option>
          <option>Criminal Defense</option>
          <option>Personal Injury</option>
          <option>Business Law</option>
          <option>Immigration</option>
          <option>Real Estate</option>
          <option>Estate Planning</option>
          <option>Employment Law</option>
          <option>Other</option>
        </select>
        <label htmlFor="yearsExperience">Years of experience</label>
        <input id="yearsExperience" name="yearsExperience" type="number" min={0} max={70} required />
        <label htmlFor="blurb">About you (shown on your profile)</label>
        <textarea id="blurb" name="blurb" required rows={4} maxLength={1000} />

        <label htmlFor="plan" style={{ marginTop: 20 }}>Plan</label>
        <select id="plan" name="plan" required defaultValue="pro">
          <option value="basic">Basic — $49/mo</option>
          <option value="pro">Pro — $99/mo</option>
          <option value="firm">Firm — $249/mo</option>
        </select>

        <button type="submit">Continue to payment</button>
        <p className="fine">
          Demo note: payment processing isn&apos;t connected yet — this is where
          Stripe checkout will go. Submitting activates your listing immediately
          for testing.
        </p>
      </form>
    </div>
  );
}
