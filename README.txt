VOXPHER v5.5 — REMOVED UNFINISHED PROJECTS (2026-10-01)
Base: your uploaded voxpher-sitee.zip code.
- Home "Proof, not promises." grid: removed NAMASTE, Deepex FF, Visual archive cards. Kept: Indoride, Hubator, FaceBengal. ("02 Visuals" world card untouched.)
- Work page: removed NAMASTE, Deepex FF, voxpher.com cards. Kept: Indoride, Hubator, FaceBengal, Visual archive, Voxpher the artist.
- Removed the Motion filter button (it would show zero results). Photography/Video filters stay (Visual archive uses them).
- Deleted work/namaste.html and work/deepex-ff.html. visuals.html KEPT (you're working on it later).
- Case-study prev/next pagers rewired: Indoride -> Hubator -> FaceBengal -> Indoride.
- sitemap.xml: removed the 2 deleted page URLs. js/site.js: removed unused image keys (workNamaste, workDeepex, workSite).
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v5.4 — HUMANIZED COPY: removed all unnecessary em dashes (2026-09-30)
- 200+ " — " instances across all 17 pages rewritten with commas, periods, colons and parentheses.
- Page titles now use ":" (e.g. "NAMASTE: Beat-Synced Animated Film | Voxpher").
- Meta/OG/Twitter descriptions rewritten without dashes; JSON-LD kept in sync.
- Contact form messages (email subject, status texts) humanized too.
- En dashes kept ONLY for the two price ranges (₹25k – ₹75k), which is correct usage.
- Also fixed: studio colophon now correctly says "Archivo Black + Space Mono".
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v5.3 — SIGNATURE LOGO + FAVICON + MUSICAL-ARTIST SEO (2026-09-30)
------------------------------------------------------------
- Header + footer: the solid "VOXPHER." text is replaced by your
  signature image as the website logo (Cloudinary SIgnn1.png).
  Swap it any time in js/site.js -> images -> logoImg.
- Favicon: now your VX monogram (Cloudinary vxx.png), plus an
  Apple touch icon. Old red "V" square is gone.
- SEO rebuilt around your Knowledge Panel identity:
  * Titles/descriptions on all 17 pages now lead with
    "Voxpher - Musical Artist" (home: "Voxpher - Musical Artist
    | Papan Sutradhar").
  * New meta on every page: author, theme-color (#E10600),
    og:site_name, og:locale. 404 is now noindex.
  * JSON-LD: home is now a MusicGroup (name Voxpher, genre Hip
    Hop/Rap, since 2018, Gangarampur WB India) with sameAs links
    to your Instagram + ffm.bio; music + about pages upgraded.
  * Only verified profile URLs are used - Spotify/Apple Music/
    YouTube artist IDs were not printed anywhere, so they stay
    out until you paste the exact links.
- Instagram (instagram.com/voxpher) is now wired in js/site.js
  socials, so the Instagram icon appears in the footer/contact.
Deploy: replace site files with this package, push, hard-refresh.

VOXPHER v5.2 — CARD GAP + HERO SIGNATURE REMOVED (2026-09-30)
-------------------------------------------------------
- "Proof, not promises." (home) and "Built, deployed, real."
  (build page): the work-cards grid now has the same 2.4rem gap
  under the title as every other card section on the site
  (it was the only grid with zero top margin).
- Home hero: the "Papan Sutradhar - Founder, Voxpher" signature
  card is removed completely (HTML block, its image key in
  js/site.js, and its CSS rules). The hero now goes straight
  from the intro paragraph to the two buttons.
Deploy: replace site files with this package, push, hard-refresh.

VOXPHER v5.1 — DESKTOP WIDTH + CENTERING FIX (2026-09-29 night)
-------------------------------------------------------
Follow-up to your screenshots of the live site. What changed:
- Desktop is WIDER: content column 76rem -> 88rem, so header,
  footer and every section stretch wider on big screens.
- Header is full-width again (no narrow centered bar).
- "HAVE AN IDEA?" heading now fits on one line at every width
  (was getting cut off on the right on desktop).
- CTA section content is truly centered: heading, paragraph and
  the START A PROJECT button (the button was stuck left before).
- The "honest note" block on music + visuals pages is centered.
Deploy: replace site files with this package, push, then hard-
refresh (Ctrl+Shift+R) so your browser drops the old CSS.

VOXPHER v5 — FULL SITE AUDIT + FIX (2026-09-29)
------------------------------------------------
Senior front-end / QA pass across all 17 pages. What changed:
- Home hero photo + overlay REMOVED — header and hero are now one
  solid flat brand red (#E10600), no gradients, no vignette, no seams.
  1px black header border kept.
- Sharp square corners EVERYWHERE: global border-radius:0 safety net
  plus every pill/circle/rounded rule removed individually.
- Contrast fixed to WCAG AA: white text on red, white kickers, white
  buttons/filters/menu links, strong focus ring.
- Nav: hamburger below 1024px, full red menu panel, closes on link /
  Escape / outside tap, locks body scroll, active-page highlight.
- Spinning "Since 2018" badge: clickable (scrolls to next section),
  keyboard accessible, hidden below 640px.
- PORTRAIT NOTE: your Cloudinary papan.jpg returns 404 (never uploaded
  under that name). The home + about portraits are now clean black
  "PS / Portrait coming soon" placeholder blocks — no broken icons.
  Send me the correct portrait URL and I'll wire it in one line.
- Favicon now brand red, og:image points at your real papa.png banner.
- See section 2 for the current image keys in js/site.js.

------------------------------------------------
OLDER NOTES (v3/v4) — kept for reference
------------------------------------------------

================================================================
VOXPHER — voxpher.com · complete website package
Papan Sutradhar · Music · Design · Code · Visuals
================================================================

WHAT THIS IS
-----------
A complete, hand-built multi-page website. Plain HTML + CSS + JS,
no frameworks, no build step, no database. Upload it and it runs.

FOLDER STRUCTURE (keep exactly as-is)
-----------
voxpher-website/
  index.html            Home
  about.html            Story, timeline, background
  work.html             Filterable portfolio index
  music.html            Voxpher the artist
  visuals.html          Photo/video gallery (masonry)
  build.html            Technology / "things I've worked with"
  services.html         Services accordion
  studio.html           Principles, process, tools, colophon
  contact.html          Contact page + form
  privacy.html          Privacy policy (honest, plain)
  terms.html            Terms of use (short)
  404.html              Custom not-found page
  work/
    indoride.html       Case study — ride-booking product
    hubator.html        Case study — e-commerce brand
    namaste.html        Case study — animated film
    deepex-ff.html      Project — gaming content brand
    facebengal.html     Project — platform concept
  css/
    style.css           The entire design system
  js/
    site.js             ★ YOUR SETTINGS — images, email, socials ★
    main.js             Behavior (menu, filters, form). Don't touch.
  _headers              Cloudflare security headers (auto-applied)
  robots.txt            Search-engine rules
  sitemap.xml           All pages for Google
  README.txt            This file

----------------------------------------------------------------
1) DEPLOY ON CLOUDFLARE PAGES
----------------------------------------------------------------
OPTION A — Git (recommended, auto-updates on every push):
  1. Put THIS folder's contents at the root of your GitHub repo
     (index.html must be at the top level, not inside a subfolder).
  2. Cloudflare dashboard → Workers & Pages → Create → Pages →
     Connect to Git → pick the repo.
  3. Framework preset: None. Build command: (empty).
     Build output directory: (empty). Save and Deploy.
  4. You get https://your-project.pages.dev instantly.

OPTION B — Direct upload (fastest, no Git):
  1. Workers & Pages → Create → Pages → Upload assets.
  2. Drag in index.html, css/, js/ and the other files
     (everything at top level). Deploy.

CUSTOM DOMAIN (voxpher.com):
  Pages project → Custom domains → Set up a custom domain →
  enter voxpher.com → Activate. Cloudflare configures DNS itself.
  In Cloudflare → SSL/TLS, keep "Always Use HTTPS" ON.

----------------------------------------------------------------
2) CHANGE IMAGES  ★ the file you asked about ★
----------------------------------------------------------------
Open js/site.js. Every image on the site is listed there with a
plain-English comment telling you the shape to keep
(tall 3:4 portraits, wide 16:9 banners, 4:3 cards).

  images: {
    signatureImg: "https://res.cloudinary.com/.../SIgnn1.png",
    ...
  }

Paste your image URL between the quotes, save, re-deploy. Done.

PORTRAITS: the home + about portrait slots currently show a clean
black placeholder block because the Cloudinary file
".../papan.jpg" does not exist (returns 404). To put your real
photo in: (1) upload it to Cloudinary/R2, (2) in about.html and
index.html replace the <div class="ph ..."> block with
<img data-img="portrait" ...>, (3) add  portrait: "YOUR-URL"
to the images list in js/site.js. Or just send me the URL and
I'll do it.

----------------------------------------------------------------
3) SOCIAL LINKS
----------------------------------------------------------------
In js/site.js, fill ONLY real, verified profile URLs:

  socials: { instagram: "https://instagram.com/yourname", ... }

Leave any platform empty ("") and it will NOT appear on the site.
Never invent usernames — the site hides unconfigured platforms.

----------------------------------------------------------------
4) EMAIL
----------------------------------------------------------------
In js/site.js:  email: "hello@voxpher.com"
Change it once and it updates the contact page + footers.

----------------------------------------------------------------
5) CONTACT FORM — make it email you
----------------------------------------------------------------
The form already validates (name, email format, project type,
message length) and blocks spam bots with a hidden honeypot field.

TO RECEIVE MESSAGES BY EMAIL (2 minutes):
  1. Sign up free at https://formspree.io and create a form.
  2. Copy your endpoint (looks like https://formspree.io/f/abcdwxyz).
  3. In js/site.js set:  formspreeEndpoint: "https://formspree.io/f/abcdwxyz"
  4. Re-deploy. Messages now land in your inbox.

UNTIL THEN: the form still works — it opens the visitor's email app
with the message pre-addressed to you. Nothing is lost, and there is
no fake "sent" message.

----------------------------------------------------------------
6) EDIT TEXT
----------------------------------------------------------------
All words live in the .html files. Open the page, find the sentence,
rewrite it, save, re-deploy. That's the whole CMS.

----------------------------------------------------------------
7) SECURITY (already handled)
----------------------------------------------------------------
- _headers applies a strict Content-Security-Policy, nosniff,
  referrer and permissions policies on Cloudflare Pages automatically.
- No inline scripts or styles anywhere (that's why the CSP is strict).
- No secrets, keys or credentials anywhere in the code.
- Contact form: client validation + honeypot + Formspree's own
  spam/rate protection. For extra hardening later, add Cloudflare
  Turnstile to the form.
- In Cloudflare dashboard you can also enable HSTS + "Always Use HTTPS".

----------------------------------------------------------------
8) BEFORE LAUNCH — checklist
----------------------------------------------------------------
[ ] Replace ALL placeholder images in js/site.js with real work
[ ] Add verified social URLs (or leave empty — they stay hidden)
[ ] Set your Formspree endpoint (or keep the email-app fallback)
[ ] Open every page once: menu, filters, accordion, form, footer links
[ ] Check on your phone (menu, no sideways scrolling)
[ ] Connect voxpher.com as custom domain
[ ] Submit sitemap: Google Search Console → https://voxpher.com/sitemap.xml

----------------------------------------------------------------
9) HOUSE RULES (built into the copy)
----------------------------------------------------------------
- Every project is labeled Product / Personal / Concept — honestly.
- No invented clients, stats, followers, awards or revenue.
- No fake buttons: everything clickable goes somewhere real.
- First-person voice throughout: "I build. I design. I make music."

Made by D for Papan Sutradhar — September 2026.

----------------------------------------------------------------
HOSTING YOUR OWN PHOTO + SIGNATURE (Cloudflare R2)
----------------------------------------------------------------
1. Go to dash.cloudflare.com -> R2 Object Storage (left menu)
   -> "Create bucket" -> name it voxpher-media -> Create.
2. Open the bucket -> Upload -> choose your photo and your
   signature file -> Upload.
   Tips: no spaces in file names (photo.jpg, signature.png).
   Photo = JPG. Signature = PNG with transparent background
   if possible (looks cleanest on the dark site).
3. In the bucket, go to Settings -> Public access ->
   "Allow public access" -> confirm. You will see a public
   bucket URL like https://pub-ab12cd34.r2.dev
4. Go back to Objects, click your photo -> copy its URL
   (https://pub-ab12cd34.r2.dev/photo.jpg). Do the same for
   the signature.
5. Send the photo URL to me and I will put it in the site.
   OR do it yourself: open js/site.js, find the images list and
   add  portrait: "YOUR-URL"  between the quotes; in about.html
   and index.html replace the <div class="ph ..."> placeholder
   with  <img data-img="portrait" ...>.  Save, re-upload/push, done.
   (The signature slot is the  signatureImg:  key in js/site.js.)
SIMPLER ALTERNATIVE (no R2 needed): put the two files in an
images/ folder inside this website folder, push to GitHub,
and use https://voxpher.com/images/photo.jpg as the URL.
