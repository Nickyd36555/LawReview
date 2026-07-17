import { GradeBadge, Stoplight } from '../components/ui';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Peace of mind, <em>before</em> you hire.</h1>
        <div className="hero-rule" />
        <p>
          Choosing a lawyer is one of life&apos;s most stressful decisions.
          LawReview makes it simple: every lawyer carries a report-card grade —
          A through F — earned from real client reviews, and a stoplight that
          gives you the bottom line at a glance. Green means you&apos;re in good
          hands. Red means think twice.
        </p>
        <SearchBar />
        <div className="key-strip">
          <div className="item"><GradeBadge grade="A" size={30} /> Report-card grades from real clients</div>
          <div className="item"><Stoplight active="green" size={12} /> Green — you&apos;re in good hands</div>
          <div className="item"><Stoplight active="red" size={12} /> Red — think twice</div>
        </div>
      </section>
    </>
  );
}
