# How to create your `.env` file, one small step at a time

You are going to make one small file called `.env`. That's it. Nothing else.

This guide never asks you to write code. You will copy four lines, paste two
values from a website, and save. Take it slowly and check off each step.

---

## What is a `.env` file, in plain words?

Your app needs two secrets to talk to your database: an **address** and a
**password-ish key**.

Those secrets must not be typed into your code, because code gets shared and
uploaded to GitHub. So instead you put them in a little side file named `.env`,
and the app reads them from there when it starts up.

Think of `.env` as a sticky note that stays on your desk and never goes in the
envelope you mail out.

The name is literally `.env` — starting with a dot, with no `.txt` on the end.
The dot at the front is what makes Linux treat it as a hidden file.

---

## Before you start: get your two values

You need these from the Supabase website. If you don't have them yet, stop here
and get them first, then come back.

1. Go to https://supabase.com/dashboard and open your project.
2. Click the **Connect** button at the top. Copy the **Project URL**.
   It looks like: `https://abcdefghijkl.supabase.co`
3. Go to **Settings** (the gear) → **API Keys**. Find the **Secret keys**
   section and copy the key that starts with `sb_secret_`.
   If there isn't one yet, click the button to create one, then copy it.

Paste both into a scratch note for a minute. You'll need them in Step 5.

> The secret key is powerful — it can read and change everything in your
> database. Treat it like a house key. Never paste it into a chat, a webpage,
> or a file that starts with `NEXT_PUBLIC_`.

---

## Step 1 — Open a terminal and go to the right folder

The `.env` file has to sit in the `backend` folder. Not the project root, not
`src`. This matters, and Step 8 explains why.

Type this and press Enter:

```bash
cd ~/react-repos-folder/dnd-proj/backend
```

**Check yourself.** Run this:

```bash
pwd
```

It must print exactly:

```
/home/matthewcopello/react-repos-folder/dnd-proj/backend
```

If it prints something else, run the `cd` command again. Do not continue until
this matches.

---

## Step 2 — Confirm you are in the folder you think you are

Run:

```bash
ls
```

You should see `package.json`, `src`, `test`, and `nest-cli.json` in the list.

If you don't see those, you're in the wrong folder. Go back to Step 1.

---

## Step 3 — Make a copy of the example file

There is already a file called `.env.example` here. It is a blank template with
the right *names* in it but fake *values*. You will copy it and then fill in
the real values.

Run:

```bash
cp .env.example .env
```

Nothing will print. Silence means it worked.

**Check yourself.** Run:

```bash
ls -a
```

`ls` on its own hides files that begin with a dot. The `-a` means "show all",
so now you should see both `.env.example` and `.env` in the list.

---

## Step 4 — Look at what you just made

Run:

```bash
cat .env
```

You should see four lines:

```
PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_CHARACTERS_TABLE=characters
```

Two of these are already correct and you should leave them alone:

- `PORT=3000` — which door your backend listens on.
- `SUPABASE_CHARACTERS_TABLE=characters` — the table name from `schema.sql`.

Two are fake and you must replace them:

- `SUPABASE_URL` — currently says `your-project-ref`.
- `SUPABASE_SERVICE_ROLE_KEY` — currently says `your-service-role-key`.

---

## Step 5 — Fill in your real values

Open the file in Cursor. This is the easiest way:

```bash
cursor .env
```

If that doesn't open anything, use the terminal editor instead:

```bash
nano .env
```

In `nano`, use the arrow keys to move around. When you are finished, press
`Ctrl+O` then `Enter` to save, then `Ctrl+X` to quit.

Now replace the two fake values so the file reads like this, using your own
Project URL and your own secret key:

```
PORT=3000
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_real_key_here
SUPABASE_CHARACTERS_TABLE=characters
```

Save the file.

---

## Step 6 — The five mistakes that break this file

Your app reads this file with a small hand-written parser
(`src/config/load-env.ts`). It is simple, which means it is picky. Here is
exactly what it does and does not forgive.

**1. No trailing slash on the URL.**

```
SUPABASE_URL=https://abcdefghijkl.supabase.co      ← correct
SUPABASE_URL=https://abcdefghijkl.supabase.co/     ← wrong
```

The code glues `/rest/v1` onto the end of your URL. A trailing slash produces a
double slash and the request fails.

**2. Do not write `export`.**

```
SUPABASE_URL=https://...          ← correct
export SUPABASE_URL=https://...   ← wrong
```

The parser splits on the first `=` and would treat `export SUPABASE_URL` as the
whole name, so your real setting would be ignored.

**3. No comments at the end of a line.**

```
PORT=3000                ← correct
PORT=3000 # my port      ← wrong, the value becomes "3000 # my port"
```

A `#` at the *start* of its own line is fine and is ignored. A `#` partway
through a line is treated as part of the value.

**4. One setting per line, and don't wrap in quotes unless you mean to.**

Quotes around the whole value are stripped for you, so
`SUPABASE_URL="https://..."` works. But plain, unquoted values are simpler.
Never use quotes on only one side.

**5. Spaces around the `=` are fine, but don't add spaces inside the key.**

`PORT = 3000` works because the parser trims spaces. `MY PORT=3000` does not.

---

## Step 7 — Check your file looks right

Run this to see your file with visible line endings:

```bash
cat -A .env
```

Each line should end with a single `$`. If you see `^M$`, the file has Windows
line endings and you should fix it with:

```bash
sed -i 's/\r$//' .env
```

Then confirm the values took, without printing your secret to the screen:

```bash
grep -c SUPABASE .env
```

That must print `3`.

---

## Step 8 — Why the folder mattered

Your app looks for `.env` in **whatever folder you were standing in when you
started it**, not next to the code. That's this line in `src/config/load-env.ts`:

```
const envPath = resolve(process.cwd(), filename);
```

`process.cwd()` means "current working directory" — the folder your terminal
was in when you typed the start command.

So you must always start the backend from the `backend` folder:

```bash
cd ~/react-repos-folder/dnd-proj/backend   ← first, always
pnpm start:dev                             ← then this
```

If you start it from somewhere else, the file is silently skipped. There is no
error message, because `load-env.ts` just quietly returns when it can't find
the file. Your app will then act as if you never made a `.env` at all.

---

## Step 9 — Start the backend

```bash
cd ~/react-repos-folder/dnd-proj/backend
pnpm start:dev
```

Wait for a line that says:

```
[NestApplication] Nest application successfully started
```

Leave this terminal running. It stays running on purpose — that's the server
doing its job. Open a **second** terminal for the next step.

---

## Step 10 — Prove it works

In your second terminal:

```bash
curl http://localhost:3000/api/characters
```

**`[]`** is success. It means: connected to Supabase, found the `characters`
table, and it's empty. Two square brackets is the win condition.

---

## If something went wrong

**"Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."**
Your `.env` was not read. Almost always this is the folder problem from Step 8.
Confirm `pwd` prints the `backend` path, then restart.

**A 401 error.** Your key is being rejected. First re-copy the key — it's long
and easy to truncate. If it still fails, the new `sb_secret_` keys are not JWTs,
and `src/characters/supabase.service.ts` also sends the key on an
`Authorization: Bearer` header, which can be rejected. Removing that one line
fixes it. Ask for help here rather than guessing.

**A message about relation "characters" does not exist.**
The database is connected, but the table isn't there. Go run
`supabase/schema.sql` in the Supabase SQL Editor.

**A message about `created_at`.** Same fix — run the full `schema.sql`, not just
the `create table` part.

**`curl` says connection refused.** The backend isn't running. Check the first
terminal from Step 9 for a crash.

---

## One last safety check

Run this from the `backend` folder:

```bash
git check-ignore -v .env
```

If it prints a line mentioning `.gitignore`, you are safe: git is ignoring your
secret and will never upload it.

If it prints **nothing at all**, stop and fix that before you commit anything,
because your secret key would be published.
