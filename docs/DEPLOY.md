# Going live: hosting, database & domain

A step-by-step runbook for taking the map from the demo to a real, private-code,
admin-editable site. Written for someone new to this — follow it top to bottom.

## The shape of the live system

```
Visitor's browser
   │  loads the site from …
   ▼
Cloudflare Pages ───────────── static site (map, search, plot shapes)
   │  the site then fetches records from …
   ▼
Supabase  ┌── public_plots (VIEW)  ← the ONLY thing the public can read
          └── plots (TABLE)        ← full records; only a logged-in admin can edit
```

- **Code** lives in a **private** GitHub repo. Nobody sees the source.
- **Cloudflare Pages** builds that repo and serves the website (free, custom domain,
  automatic HTTPS). It rebuilds every time you push to `main`.
- **Supabase** holds the plot records in a database. The public site can only read a
  *filtered view* (`public_plots`) that hides internal notes and only shows an owner
  name on vacant plots. An admin logs in to edit the real table.
- **Plot shapes** (the polygons) are a static file in the repo — not sensitive, never
  change — so they don't need the database.

There are three one-time setup jobs below: **Supabase**, **Cloudflare Pages**, and the
**domain**. Do Supabase first (the site needs its keys).

---

## Part A — Supabase (the database + admin login)

1. **Create the project.** Go to <https://supabase.com>, sign up (free), and create a
   new project. Pick a strong database password (save it) and a region near Texas
   (e.g. `us-east-1`). Wait ~2 minutes for it to provision.

2. **Create the tables.** Left sidebar → **SQL Editor** → **New query**. Open
   `supabase/schema.sql` from this repo, paste the whole thing in, and click **Run**.
   You should see "Success." This creates the `plots` table, the privacy rules, and
   the `public_plots` view.

3. **Load the data.** New query again → paste all of `supabase/seed.sql` → **Run**.
   That loads 672 plots. (If the records ever change before cutover, re-run
   `python3 scripts/export_seed.py` locally and paste the new file — it's safe to
   re-run.)

4. **Turn OFF public sign-ups** (so the only accounts are admins you invite).
   Sidebar → **Authentication** → **Sign In / Providers** (or **Settings**) → disable
   "Allow new users to sign up."

5. **Create the admin account.** Sidebar → **Authentication** → **Users** → **Add user**
   → enter the admin's email + a password. That's the login the admin will use.

6. **Grab the two public keys** the website needs. Sidebar → **Project Settings** →
   **API**:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon / public** key → this is `VITE_SUPABASE_ANON_KEY`
   These two are *safe to expose* in the website — they can only read the filtered
   view. (Never put the **service_role** key in the website; keep it secret.)

**How the admin edits data day-to-day:** for now, the admin signs in to the Supabase
dashboard → **Table Editor** → `plots`, and edits rows directly (change `status` to
`occupied`, type the `person_name` and `person_burial`, etc.). The website updates within
about a minute. (A nicer branded "Edit plot" page can come later — the database is
already the source of truth either way.)

> Optional: to carry over the private notes from `CW.xlsx` into the admin-only
> `internal_notes` column, that can be done as a separate private load — ask the dev.
> Those notes are never shown on the public site.

---

## Part B — Cloudflare Pages (hosting the website)

1. **(Recommended) Move the repo to an IABA GitHub org** before handoff, so it isn't
   under a personal account. GitHub: repo → **Settings** → **Transfer ownership**. You
   can also **make the repo private** now — Cloudflare works fine with private repos.

2. Go to <https://dash.cloudflare.com> → sign up (free) → **Workers & Pages** →
   **Create** → **Pages** → **Connect to Git**. Authorize GitHub and pick this repo.

3. **Build settings** (Cloudflare usually auto-detects Vite; confirm these):
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`

4. **Add the environment variables** (so the site can reach Supabase). In the same
   setup screen → **Environment variables** → add:
   - `VITE_SUPABASE_URL` = the Project URL from Part A
   - `VITE_SUPABASE_ANON_KEY` = the anon key from Part A

5. Click **Save and Deploy**. In ~1 minute you get a live URL like
   `cook-walden-rip.pages.dev`. Every push to `main` now auto-deploys.

6. **Retire the old GitHub Pages deploy** so there aren't two live copies: delete
   `.github/workflows/deploy.yml` (the dev can do this at cutover) and, if you like,
   turn Pages off in the repo settings.

---

## Part C — The domain (e.g. cookwalden.rip)

A domain is rented yearly from a **registrar**. Two easy paths:

**Easiest — buy it at Cloudflare** (same dashboard, DNS auto-configures):
1. Cloudflare dashboard → **Domain Registration** → **Register Domain** → search
   `cookwalden.rip` (or `.com`) → buy (~$10–20/yr depending on the TLD).
2. Your Pages project → **Custom domains** → **Set up a domain** → type the domain →
   Cloudflare adds the DNS record for you and issues HTTPS automatically. Done.

**Or buy it elsewhere** (Namecheap, GoDaddy, etc.):
1. Buy the domain at that registrar.
2. In Cloudflare Pages → **Custom domains** → add your domain. Cloudflare shows you the
   exact **DNS record** to create (a `CNAME` pointing at your `.pages.dev` address).
3. Log in to the registrar → its **DNS** settings → add that record.
   - ⚠️ Use a real **DNS record**, *not* the registrar's "Forwarding/Redirect" feature
     (that just bounces visitors and breaks HTTPS — it's the thing to avoid).
4. Wait for it to take effect (minutes to a couple of hours). HTTPS is automatic — you
   never buy an SSL certificate.

**Subdomain option:** if IABA already owns a domain, use `map.iaba.org` instead — add
one `CNAME` record at IABA's DNS pointing to the `.pages.dev` address; no new purchase.

---

## Order of operations

1. Dev finishes the code change that makes the site read from Supabase (in progress).
2. **You:** Part A (Supabase) → gives you the URL + anon key.
3. **You:** Part B (Cloudflare Pages) with those keys → gives you a `.pages.dev` URL.
4. Verify the live `.pages.dev` site: map loads, a burial shows a name, editing a row in
   Supabase changes the site.
5. **You:** Part C (domain) → point it at the Pages site.
6. Dev removes the old GitHub Pages workflow; repo goes private.

## Before it's truly public on IABA's domain

- **Real contact email** replaces the `plots@iaba.example` placeholder in `src/config.ts`.
- **IABA leadership okay** on publishing real names/dates on IABA's own site (approved in
  principle by the project owner; confirm with IABA before wide sharing).
