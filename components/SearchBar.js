export default function SearchBar({ defaults = {} }) {
  return (
    <form className="search-bar" action="/search" method="get">
      <input
        type="text"
        name="location"
        placeholder="City or state (e.g. Austin, TX)"
        defaultValue={defaults.location || ''}
        aria-label="Location"
      />
      <select name="minGrade" defaultValue={defaults.minGrade || ''} aria-label="Minimum grade">
        <option value="">Any grade</option>
        <option value="A">A only</option>
        <option value="B">B or better</option>
        <option value="C">C or better</option>
        <option value="D">D or better</option>
      </select>
      <select name="stoplight" defaultValue={defaults.stoplight || ''} aria-label="Stoplight">
        <option value="">Any light</option>
        <option value="green">🟢 Green — OK to hire</option>
        <option value="yellow">🟡 Yellow — caution</option>
        <option value="red">🔴 Red — think twice</option>
      </select>
      <button type="submit">Search</button>
    </form>
  );
}
