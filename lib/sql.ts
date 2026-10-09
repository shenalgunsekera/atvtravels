// All Postgres statements used by the app, kept dependency-free so they can be tested directly.

export const MAX_BACKUPS_PER_DOC = 40;
export const SCHEMA_LOCK_ID = 727274001; // arbitrary key for pg_advisory_xact_lock

// Tables are created on first use, so there's no separate migration step to run.
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS content_docs (
     name text PRIMARY KEY,
     data jsonb NOT NULL,
     version integer NOT NULL DEFAULT 1,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS content_backups (
     id bigserial PRIMARY KEY,
     doc text NOT NULL,
     data jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS content_backups_doc_idx ON content_backups (doc, id DESC)`,
  `CREATE TABLE IF NOT EXISTS admin_login_attempts (
     ip text PRIMARY KEY,
     count integer NOT NULL,
     reset_at timestamptz NOT NULL
   )`,
  // Uploaded images when Cloudinary isn't configured (resized to ≤2000px WebP first).
  `CREATE TABLE IF NOT EXISTS media_files (
     id text PRIMARY KEY,
     name text NOT NULL,
     mime text NOT NULL,
     size integer NOT NULL,
     width integer,
     height integer,
     data bytea NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

// Binary data is passed as hex / returned as base64 text so it works with any Postgres driver.
export const MEDIA_SQL = {
  insert: `INSERT INTO media_files (id, name, mime, size, width, height, data) VALUES ($1, $2, $3, $4, $5, $6, decode($7, 'hex'))`,
  list: `SELECT id, name, mime, size, width, height, created_at FROM media_files ORDER BY created_at DESC LIMIT 2000`,
  get: `SELECT mime, encode(data, 'base64') AS b64 FROM media_files WHERE id = $1`,
  delete: `DELETE FROM media_files WHERE id = $1`,
};

export const CONTENT_SQL = {
  read: `SELECT data, version FROM content_docs WHERE name = $1`,
  seed: `INSERT INTO content_docs (name, data) VALUES ($1, $2::jsonb) ON CONFLICT (name) DO NOTHING`,
  // Backs up the current row and replaces it in one statement. $2 = expected version, or NULL to force.
  // No FOR UPDATE in `prev`: the UPDATE would run first and the locked SELECT would then skip the
  // row it just changed, so no backup would be written. The UPDATE re-checks the version under its
  // own row lock, so concurrent saves are still rejected.
  write: `
    WITH prev AS (
      SELECT data FROM content_docs
      WHERE name = $1 AND ($2::int IS NULL OR version = $2::int)
    ), backup AS (
      INSERT INTO content_backups (doc, data) SELECT $1, data FROM prev
    )
    UPDATE content_docs SET data = $3::jsonb, version = version + 1, updated_at = now()
    WHERE name = $1 AND ($2::int IS NULL OR version = $2::int)
    RETURNING version`,
  prune: `
    DELETE FROM content_backups
    WHERE doc = $1 AND id < (
      SELECT id FROM content_backups WHERE doc = $1 ORDER BY id DESC OFFSET ${MAX_BACKUPS_PER_DOC - 1} LIMIT 1
    )`,
  listBackups: `
    SELECT id::text AS id, doc, created_at, octet_length(data::text) AS size
    FROM content_backups ORDER BY id DESC LIMIT 200`,
  readBackup: `SELECT doc, data FROM content_backups WHERE id = $1::bigint`,
};

export const LOGIN_SQL = {
  get: `SELECT count FROM admin_login_attempts WHERE ip = $1 AND reset_at > now()`,
  fail: `
    INSERT INTO admin_login_attempts (ip, count, reset_at) VALUES ($1, 1, now() + interval '15 minutes')
    ON CONFLICT (ip) DO UPDATE SET
      count = CASE WHEN admin_login_attempts.reset_at < now() THEN 1 ELSE admin_login_attempts.count + 1 END,
      reset_at = CASE WHEN admin_login_attempts.reset_at < now() THEN now() + interval '15 minutes' ELSE admin_login_attempts.reset_at END`,
  clear: `DELETE FROM admin_login_attempts WHERE ip = $1 OR reset_at < now()`,
};
