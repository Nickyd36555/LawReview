import { GradeBadge, Stoplight } from '../components/ui';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Know before you hire.</h1>
        <p>
          LawReview grades lawyers like a report card — A through F — based on
          reviews from real clients. Our stoplight tells you the bottom line at
          a glance: green means they&apos;re OK to hire, red means think twice.
        </p>
        <SearchBar />
        <div className="key-strip">
          <div className="item"><GradeBadge grade="A" size={28} /> Report-card grades from client reviews</div>
          <div className="item"><Stoplight active="green" size={12} /> Green = OK to hire</div>
          <div className="item"><Stoplight active="red" size={12} /> Red = think twice</div>
        </div>
      </section>
    </>
  );
}
