import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'lawreview.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lawyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    firm TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    practice_area TEXT NOT NULL,
    blurb TEXT NOT NULL,
    base_grade TEXT NOT NULL DEFAULT 'C',
    stoplight TEXT NOT NULL DEFAULT 'yellow',
    years_experience INTEGER DEFAULT 0,
    claimed_by INTEGER REFERENCES users(id),
    subscription_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lawyer_id INTEGER NOT NULL REFERENCES lawyers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (lawyer_id, user_id)
  );
`);

// ---- Grades ----------------------------------------------------------------

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'F'];

export function gradeFromAverage(avg) {
  if (avg >= 4.5) return 'A';
  if (avg >= 3.5) return 'B';
  if (avg >= 2.5) return 'C';
  if (avg >= 1.5) return 'D';
  return 'F';
}

// A lawyer's displayed grade: report-card average of client reviews once they
// have any; the editorial base grade until then.
export function effectiveGrade(lawyer) {
  if (lawyer.review_count > 0) return gradeFromAverage(lawyer.avg_rating);
  return lawyer.base_grade;
}

export function gradeAtLeast(grade, minGrade) {
  return GRADE_ORDER.indexOf(grade) <= GRADE_ORDER.indexOf(minGrade);
}

// ---- Queries ---------------------------------------------------------------

const LAWYER_SELECT = `
  SELECT l.*,
         COUNT(r.id) AS review_count,
         COALESCE(AVG(r.rating), 0) AS avg_rating
  FROM lawyers l
  LEFT JOIN reviews r ON r.lawyer_id = l.id
`;

export function searchLawyers({ location = '', minGrade = '', stoplight = '' }) {
  const rows = db.prepare(`${LAWYER_SELECT} GROUP BY l.id ORDER BY l.name`).all();
  const loc = location.trim().toLowerCase();
  return rows.filter((l) => {
    if (loc) {
      const hay = `${l.city}, ${l.state} ${l.state}`.toLowerCase();
      if (!hay.includes(loc)) return false;
    }
    if (stoplight && l.stoplight !== stoplight) return false;
    if (minGrade && !gradeAtLeast(effectiveGrade(l), minGrade)) return false;
    return true;
  });
}

export function getLawyerBySlug(slug) {
  return db.prepare(`${LAWYER_SELECT} WHERE l.slug = ? GROUP BY l.id`).get(slug);
}

export function getReviews(lawyerId) {
  return db
    .prepare(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.lawyer_id = ? ORDER BY r.created_at DESC`
    )
    .all(lawyerId);
}

export function addReview({ lawyerId, userId, rating, title, body }) {
  db.prepare(
    `INSERT INTO reviews (lawyer_id, user_id, rating, title, body)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (lawyer_id, user_id)
     DO UPDATE SET rating = excluded.rating, title = excluded.title,
                   body = excluded.body, created_at = datetime('now')`
  ).run(lawyerId, userId, rating, title, body);
}

export function createUser({ email, name, passwordHash, role = 'client' }) {
  const info = db
    .prepare(`INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)`)
    .run(email.toLowerCase().trim(), name.trim(), passwordHash, role);
  return getUserById(info.lastInsertRowid);
}

export function getUserByEmail(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email.toLowerCase().trim());
}

export function getUserById(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

export function createLawyerListing({ userId, name, firm, city, state, practiceArea, blurb, yearsExperience }) {
  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' + Math.random().toString(36).slice(2, 6);
  db.prepare(
    `INSERT INTO lawyers (slug, name, firm, city, state, practice_area, blurb,
                          years_experience, claimed_by, subscription_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(slug, name, firm, city, state, practiceArea, blurb, yearsExperience || 0, userId);
  return slug;
}

// ---- Seed data -------------------------------------------------------------

const seedCount = db.prepare('SELECT COUNT(*) AS n FROM lawyers').get().n;
if (seedCount === 0) {
  const seed = db.prepare(
    `INSERT INTO lawyers (slug, name, firm, city, state, practice_area, blurb,
                          base_grade, stoplight, years_experience, subscription_active)
     VALUES (@slug, @name, @firm, @city, @state, @practice_area, @blurb,
             @base_grade, @stoplight, @years_experience, 1)`
  );
  const lawyers = [
    { slug: 'maria-santos', name: 'Maria Santos', firm: 'Santos Family Law', city: 'Austin', state: 'TX', practice_area: 'Family Law', base_grade: 'A', stoplight: 'green', years_experience: 14, blurb: 'Maria has guided hundreds of Texas families through divorce, custody, and adoption with a calm, straightforward style. Clients praise her responsiveness and her knack for settling cases without unnecessary courtroom battles.' },
    { slug: 'james-whitfield', name: 'James Whitfield', firm: 'Whitfield & Associates', city: 'Austin', state: 'TX', practice_area: 'Criminal Defense', base_grade: 'B', stoplight: 'green', years_experience: 22, blurb: 'A former prosecutor, James knows both sides of the courtroom. He handles everything from DWI to felony defense and is known for blunt, honest case assessments.' },
    { slug: 'linda-okafor', name: 'Linda Okafor', firm: 'Okafor Injury Group', city: 'Houston', state: 'TX', practice_area: 'Personal Injury', base_grade: 'A', stoplight: 'green', years_experience: 11, blurb: 'Linda focuses exclusively on serious injury and accident cases. She works on contingency, communicates weekly, and has recovered millions for Houston-area clients.' },
    { slug: 'robert-kane', name: 'Robert Kane', firm: 'Kane Legal', city: 'Houston', state: 'TX', practice_area: 'Business Law', base_grade: 'C', stoplight: 'yellow', years_experience: 9, blurb: 'Robert advises small businesses on contracts, formation, and disputes. Clients describe solid work, though several note slow turnaround during busy stretches.' },
    { slug: 'sofia-delgado', name: 'Sofia Delgado', firm: 'Delgado Immigration Law', city: 'Miami', state: 'FL', practice_area: 'Immigration', base_grade: 'A', stoplight: 'green', years_experience: 16, blurb: 'Sofia handles family visas, asylum, and citizenship cases in English and Spanish. Her office is known for meticulous paperwork and honest timelines.' },
    { slug: 'daniel-price', name: 'Daniel Price', firm: 'Price & Rowe', city: 'Miami', state: 'FL', practice_area: 'Real Estate', base_grade: 'D', stoplight: 'yellow', years_experience: 7, blurb: 'Daniel closes residential and commercial deals across South Florida. Reviews are mixed: strong negotiating, but repeated complaints about missed calls and surprise fees.' },
    { slug: 'angela-brooks', name: 'Angela Brooks', firm: 'Brooks Defense', city: 'Chicago', state: 'IL', practice_area: 'Criminal Defense', base_grade: 'B', stoplight: 'green', years_experience: 18, blurb: 'Angela is a fixture in Cook County courts, respected by judges and feared by prosecutors. She takes fewer cases so each client gets her personal attention.' },
    { slug: 'victor-malone', name: 'Victor Malone', firm: 'Malone Law Office', city: 'Chicago', state: 'IL', practice_area: 'Personal Injury', base_grade: 'F', stoplight: 'red', years_experience: 25, blurb: 'Victor advertises heavily and takes a high volume of injury cases. Numerous clients report unreturned calls, missed deadlines, and settlements that dragged on for years.' },
    { slug: 'grace-lin', name: 'Grace Lin', firm: 'Lin Estate Planning', city: 'Seattle', state: 'WA', practice_area: 'Estate Planning', base_grade: 'A', stoplight: 'green', years_experience: 12, blurb: 'Grace makes wills, trusts, and probate feel simple. Flat fees, plain-English documents, and patient explanations earn her consistently glowing feedback.' },
    { slug: 'harold-strickland', name: 'Harold Strickland', firm: 'Strickland Litigation', city: 'Seattle', state: 'WA', practice_area: 'Business Law', base_grade: 'D', stoplight: 'red', years_experience: 30, blurb: 'A veteran litigator with big-case experience, Harold has recently drawn complaints about billing disputes and abrasive communication. Proceed with caution.' },
    { slug: 'nina-petrov', name: 'Nina Petrov', firm: 'Petrov Employment Law', city: 'Denver', state: 'CO', practice_area: 'Employment Law', base_grade: 'B', stoplight: 'green', years_experience: 10, blurb: 'Nina represents workers in wrongful termination, discrimination, and wage cases. Clients call her tenacious and appreciate her free initial consultations.' },
    { slug: 'carl-jensen', name: 'Carl Jensen', firm: 'Jensen & Sons', city: 'Denver', state: 'CO', practice_area: 'Family Law', base_grade: 'C', stoplight: 'yellow', years_experience: 20, blurb: 'Carl is an old-school family lawyer with decades of courtroom experience. Effective, but some clients find his communication style dated and his fees unpredictable.' },
  ];
  const insertAll = db.transaction(() => lawyers.forEach((l) => seed.run(l)));
  insertAll();
}

export default db;
