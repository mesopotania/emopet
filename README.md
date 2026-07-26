# emopet

emopet is a wellbeing companion for dogs, imagined in Brittany. A worn textile,
a rest station and a small medallion watch a dog's day and help their person
understand them a little better. It is not a medical device and it does not
track location. It reads activity and rest, sets them against a dog's own
rhythm, and stays honest about how sure it is.

This repository is the site people see first: a calm, bilingual landing page
where early families can join the waitlist.

## See it live

- French: https://mesopotania.github.io/emopet/
- English: https://mesopotania.github.io/emopet/en/

(These go live once GitHub Pages is switched on for the branch. Until then, run
it locally with the steps below.)

## What it is built with

Plain HTML, CSS and vanilla JavaScript. No framework, no build server. Two real
pages, one per language, so each has its own URL and works with the browser back
button. Everything you would expect is here: light and dark themes, the hover
chart, the product carousel, the reading card, and the waitlist form.

## Run it on your machine

You need Node installed. From this folder:

```
node serve.mjs
```

Then open http://localhost:4610/ (French) or http://localhost:4610/en/ (English).
Keep the terminal window open while you browse; close it to stop.

## Change the words

All the copy, French and English, lives in one place: `messages.mjs`. Edit it,
then rebuild the two pages:

```
node build.mjs
```

That rewrites `index.html` and `en/index.html` from your text, so the two
languages never drift apart.

## The waitlist

The form talks to Supabase directly from the browser using the public anon key,
which is safe to ship. Drop your project URL and anon key into
`assets/js/config.js` and set `SUPABASE_READY` to `true`. The database needs a
`waitlist` table with row level security that allows anonymous inserts only.
Confirmation emails are handled separately, in a Supabase edge function, never
from this code.

## A note on the design

Navy and cream carry the page. Coral shows up rarely, only on the one button
that matters. The animations are slow and quiet, and they step aside for anyone
who prefers reduced motion.

emopet · Made in Brittany
