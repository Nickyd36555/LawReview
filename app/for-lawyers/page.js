import Link from 'next/link';

export default function ForLawyers() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1>Get in front of clients who are ready to hire.</h1>
        <p>
          Clients on LawReview are actively comparing lawyers by grade and
          location. Client accounts and reviews are always free — lawyers pay
          to be listed and to manage their profile.
        </p>
      </section>

      <div className="pricing">
        <div className="plan">
          <h2>Basic</h2>
          <div className="price">$49<span style={{ fontSize: '1rem' }}>/mo</span></div>
          <ul>
            <li>Professional profile page</li>
            <li>Photo, blurb &amp; practice areas</li>
            <li>Appear in location search</li>
          </ul>
        </div>
        <div className="plan featured">
          <h2>Pro</h2>
          <div className="price">$99<span style={{ fontSize: '1rem' }}>/mo</span></div>
          <ul>
            <li>Everything in Basic</li>
            <li>Respond to client reviews</li>
            <li>Priority placement in results</li>
          </ul>
        </div>
        <div className="plan">
          <h2>Firm</h2>
          <div className="price">$249<span style={{ fontSize: '1rem' }}>/mo</span></div>
          <ul>
            <li>Up to 10 lawyer profiles</li>
            <li>Firm landing page</li>
            <li>Dedicated support</li>
          </ul>
        </div>
      </div>

      <p style={{ textAlign: 'center' }}>
        <Link href="/for-lawyers/join" className="cta" style={{
          background: 'linear-gradient(180deg, var(--gold-bright), var(--gold))',
          color: '#14161a', padding: '13px 32px', borderRadius: 4,
          fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase',
          fontSize: '.92rem', display: 'inline-block',
        }}>
          Get listed today
        </Link>
      </p>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem', marginTop: 12 }}>
        Important: paying for a listing never changes your grade or stoplight.
        Those come from client reviews and our editorial standards.
      </p>
    </>
  );
}
