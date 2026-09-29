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
    homeHeroBg: "https://picsum.photos/seed/voxhero/1920/1080",
    ...
  }

Paste your image URL between the quotes, save, re-deploy. Done.
Right now they are placeholder images — swap them before launch.

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
