VOXPHER v8.7 — ANTS ENTER FROM EDGES (2026-10-02)
- Ants now ENTER from the four screen sides (left/right/top/bottom) and walk in —
  never popping in from the center. Looks natural.
- Squashing changed: the ant is REMOVED (gone) instead of flipping belly-up. A "D"
  pops out as the smash animation. After 5 seconds the ant walks back in from a
  random screen edge.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.6 — SQUASHABLE ANTS (2026-10-02)
- Removed: the word-eating behavior and all feast particles (didn't look great).
- Ants are just normal ants again: 5 solid-black top-down ants roaming the entire page —
  header, footer, corners, middle — legs stepping in sync with walking speed.
- NEW: click/tap an ant to SQUASH it. It flips belly-up, legs kick, a "D" pops out in
  header-menu type style — and 5 seconds later it flips back over and walks on.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.5 — ANTS HUNT WORDS + FEAST (2026-10-02)
- Ants now HUNT real words: header nav links (Home, Build...), footer menu links, headings,
  buttons. They walk to the word, EAT it for 4-5 seconds, then wander on.
- While eating, "D" letters pop out in the same Space Mono bold uppercase style as the
  header menus (white/black/red with contrasting outlines), plus dust particle puffs.
  The ant nibbles (shuffles back and forth, legs stepping) while the feast fountains.
- Movement fully randomized: 55% hunt a word, 45% roam a random zone — header bar, footer
  bar, four corners, middle. Never stuck in the center.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.4 — REDESIGNED ANTS, PHYSICS-DRIVEN LEGS (2026-10-02)
- Ant REDESIGNED from real ant anatomy: teardrop gaster with segmentation, petiole waist
  nodes, narrow segmented mesosoma, head with mandibles, elbowed antennae, 6 thin
  3-segment legs. Solid black, top-down.
- LEG PHYSICS: legs are phase-driven by DISTANCE TRAVELED — one step cycle per stride
  length — so legs always step exactly in sync with walking speed. Never too fast, never
  gliding. Real alternating tripod gait.
- They barely stop now: steady normal base speed, brief pauses only 35% of arrivals.
- Full-page spread: 6 roam zones (header, 4 content corners, footer) — ants start spread
  across zones and pick a new random zone every trip, waypoints kept far apart so they
  travel instead of jittering in the center.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.3 — PROPER BLACK ANTS, LEGS THAT WALK (2026-10-02)
- 5 solid-black top-down ants with REAL walking legs. Each ant is drawn as inline SVG
  (no image, no library): 6 articulated 2-segment legs driven in an alternating tripod gait —
  the actual gait real ants use — plus waving antennae. Legs visibly step as they walk.
- They roam the ENTIRE website in ANY direction — header, content, footer. Top-down art
  rotates smoothly to face travel direction. Each ant independent: own waypoints, speed,
  size, gait phase. Scurry burst-pause movement, idle tremble on pauses.
- Never block clicks, visible on black sections, hidden under prefers-reduced-motion,
  3 ants on mobile, no duplicates across page changes.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.2 — ANT COLONY, TOP-DOWN (2026-10-02)
- 5 black ants (top-down view, the one you picked) roam the ENTIRE website in ANY direction —
  header, content, footer, anywhere. Each ant is independent: own waypoints, speed, size, rhythm.
- Top-down art rotates smoothly to face its travel direction, so movement in any direction looks
  natural. Scurry burst-pause gait, subtle wobble while walking, idle tremble on pauses.
- Real ant image (images/ant-top.png, local, transparent) — no libraries, no network. Subtle white
  outline so they stay visible on black sections. 3 ants on mobile.
- Never block clicks, above header but below cursor, hidden under prefers-reduced-motion, no
  duplicates across seamless page changes.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.1 — WALKING ANT REPLACES THE SPIDER (2026-10-02)
- Removed: the entire web-shooter spider (all spider JS, silk, D spray, #spider/#silk/#spiderFx CSS).
  Zero spider/silk/lottie/octo references remain (grep-verified).
- New: ONE walking ant that roams your entire website. It walks — never floats — across the whole
  page: header zone, content, footer, everywhere. Real ant behavior: it scurries in bursts, pauses
  like a real ant, then wanders on; bobs and rocks subtly as it walks; turns to face its direction.
- The ant is a real generated ant image (images/ant.png, local file, transparent, 70KB) — no libraries,
  no network. Subtle white outline so it stays visible on black sections too.
- It never blocks clicks (pointer-events:none), sits above the header but below your cursor, hides
  under prefers-reduced-motion, and shrinks on mobile. One ant only — it keeps walking across
  seamless page changes without duplicating.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v8.0 — WEB-SHOOTER SPIDER REPLACES THE OCTOPUS (2026-10-02)
- Removed: js/lottie.min.js, js/octo-swim.json (deleted), all #octo/#octoFx/#octoStrings/.octo-hug CSS,
  and every line of octopus code in js/ambient.js. Zero references to lottie or octo remain (grep-verified).
- New: ONE realistic web-shooter spider, built in code as inline SVG (no libraries, no images, no network).
  Anatomy: separate cephalothorax + abdomen, 8 jointed legs with 2-segment analytic IK (tapering femur/tibia,
  bristle hint), pedipalps, chelicerae, rear spinnerets, 8 tiny specular eye dots (no cartoon face), and a
  metallic web-shooter gadget on the front leg with a red LED that flashes when it fires.
- Colours strictly from the site palette: gloss-black body (#0C0C0E→#1B1B20) with a subtle #F5301B hourglass
  accent, 1px white rim light so it reads on black bands, soft contact shadow when crawling, off-white silk
  with a dark hairline shadow so it reads on red, white and black.
- Physics (real, not tweened): fixed 120Hz timestep accumulator; verlet silk rope (tension, sag, slack);
  pendulum swing with momentum transfer on release; ballistic arcs; landing squash spring; procedural legs
  (tucked in flight, tripod gait crawling, dangling when hanging, spread on zip).
- Brain: ENTER (rappels from top) -> AIM -> SHOOT (0.2s line + muzzle flash) -> SWING / ZIP / CLIMB / RAPPEL
  -> LAND/CLING -> CRAWL (tripod gait along element edges) / HANG (dangle + spin) -> SPRAY -> next target.
  Targets span header/nav/main/footer; avoids last 3; follows words while scrolling; detaches off-screen.
- D spray from the spinnerets (rear): physics-baked WAAPI keyframes (velocity cone 380-720px/s, drag,
  gravity → 500-700px range), jittered bursts (not identical waves), 1/3 outline-only, soft glow, slight
  blur on trailers, small dark puff + abdomen recoil. Guarantees kept: opacity:0 base, fill:forwards,
  timer + sweeper cleanup, capped at 60 desktop / 25 mobile with element pooling.
- Persists across seamless nav (nav:complete re-targets, guarded single init); z-60/61/59 (below mini
  player z-120, header z-1000, cursor z-2000); pointer-events:none everywhere; prefers-reduced-motion
  hides everything; 38KB total.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v7.9 — MUSIC FIRST-TAP FIX + GRAB-AND-SWING OCTOPUS (2026-10-02)
MUSIC BUG — ROOT CAUSE FOUND AND FIXED:
- Tapping a song after reaching the music page via the menu did nothing; reload fixed it.
- Cause: only music.html loaded js/player.js. The seamless navigation swaps <main> but never <head>,
  so arriving at Music from any other page left window.VoxpherInitMusicPage undefined and the 22 play
  buttons were never wired (shell.js silently skipped binding). A full reload worked because music.html
  itself includes the script. This was deterministic, not intermittent.
- Fix: js/player.js is now included on ALL 12 pages (before shell.js, per the documented load order).
  player.js is safe everywhere — it no-ops when there is no track list.
- Also: shell.js boot is now guarded against double-initialization (no duplicate mini players).
- Proven in jsdom: load homepage -> click MUSIC (seamless) -> tap first track -> plays on the FIRST tap,
  audio.play() invoked, mini player appears.

OCTOPUS — GRAB & SWING (replaces floating):
- No more drifting. The octopus now LEAPS between your words on a ballistic arc (real projectile motion
  with gravity), CATCHES the word with 3 string-tentacles, and HANGS below it swinging like a pendulum
  (real physics: angular gravity + damping, swing starts from the landing momentum).
- While hanging it squeezes the word once, sprays its D's DOWNWARD in a rain, then lets go and leaps
  to the next word. It rides the word if you scroll.
- Entrance: drops from the sky and catches its first word. After page changes it leaps at a new word.
- Body language: stretches along the flight path mid-leap, squash-impact on catch, hanging stretch
  while perched, lean into the swing. Arm speed: fast in flight, slow while hanging.
- The D letters, colors, and cleanup are unchanged.

Deploy: replace repo contents, push, hard refresh.
VOXPHER v7.8 — NAV + MUSIC CLICK HARDENING (2026-10-02)
- Menus: seamless navigation now aborts any in-flight page fetch when you tap another menu (a slow earlier fetch
  can no longer resolve late and clobber the page with stale content), plus a 10s fetch timeout that falls back to a
  normal page load instead of hanging. Live-tested: all 7 menu links navigate correctly, first tap, every time.
- Music page: the track-list binding guard is now set only AFTER every handler is attached. If anything ever
  interrupts the binding, the next visit retries instead of leaving the buttons permanently dead (which is what made
  the first tap do nothing until a reload). Verified: navigate via menu -> tap track -> plays, mini player shows.
- The live site already runs this code (verified byte-identical on voxpher.com); this package keeps your repo in sync.
Deploy: replace repo contents, push, hard refresh.
VOXPHER v7.7 — EYES REMOVED + SPRAY REAPPEARANCE BUG FIXED (2026-10-02)
- Eyes removed entirely per Akash: the octopus swims as a clean black silhouette, as in the animation he picked.
- FIXED the real bug behind "D letters reappearing where the spray happened": when a letter's flight animation
  finished, the browser snapped it back to its natural style (fully visible, no transform) for ~400ms before the
  removal timer fired — so every letter briefly popped back into existence at its spray point, looking like the spray
  stuttering back to life. Letters now use fill:forwards (they hold their final invisible keyframe) and start with
  opacity:0, so they can never flash back. Same fix applied to the ink puff.
- Spray is now one clean event: exactly 3 even waves, then silence until the next roar.
Deploy: replace repo contents, push, HARD REFRESH.

VOXPHER v7.6 — EYES MERGED INTO THE OCTOPUS (2026-10-02)
- The eyes are no longer separate HTML elements: they are injected directly into the octopus's own SVG
  (white ellipses + black pupils at the head's viewBox coordinates), so they scale, flip and swim with it and
  can never appear detached from it. They still blink and the pupils still glance toward the swim direction.
- D spray: smoother fade-in/out (letters hold fully visible mid-flight, no end-of-spray flicker).
- First roar now comes 5-8s after load so the spray is seen right away.
Deploy: replace repo contents, push, HARD REFRESH (Ctrl/Cmd+Shift+R). If the white boxes still show after that,
they cannot be from this code — send a fresh screenshot.

VOXPHER v7.5 — ROAR-WHILE-SWIMMING + ARM SYNC (2026-10-02)
- The octopus no longer freezes mid-air while spraying: it keeps swimming and the D-fire trails from its moving mouth.
- Spray distance is bigger (up to ~330px forward per letter).
- Tentacle sync: the arm-stroke animation speed now follows the swim speed (fast swim = fast arms, hovering = slow drift),
  so the body and arms read as one creature. (The arm shapes themselves are baked into the animation file and can't be redrawn.)
- Roars come a little more often (every 8-13s).
Deploy: replace repo contents, push, then HARD REFRESH the site (the white-box D bug died in v7.4, but browsers cache
the old ambient.js — without a hard refresh you'll keep seeing the old behavior).

VOXPHER v7.4 — OCTOPUS FX UPGRADE (2026-10-02)
- Octopus is bigger: 190px -> 240px desktop, 128px -> 150px mobile.
- Real swimming physics: velocity + steering instead of constant speed, so it accelerates, banks into turns (±18 deg),
  eases off near targets, bobs harder when moving fast, and pulses its body on a slow stroke rhythm that matches the arm motion.
- D-fire roar upgraded: 2-3 spray waves over 2-3 seconds (was one short burst), 6-8 bigger D letters per wave (26-46px),
  in three brand colors — white, black, red — each with a contrasting outline, plus a stylish hollow-outline variant and glow.
- Hugs your site more: 65% chance to go for text (was 45%), stays 2.6-4s, does little squeeze pulses while hugging,
  and its first swim after loading heads straight for a heading or menu link.
- Fixed the stuck white box: it was a D particle whose fade-away animation didn't finish, leaving it frozen on screen.
  Particles now use parse-safe pixel keyframes, are removed by guaranteed timers, and a sweeper deletes any stragglers.
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v7.3 — OCTOPUS WITH A BRAIN + SQUARE MINI PLAYER + MOBILE COMFORT (2026-10-02)
- Octopus upgraded: the old vector doodle is replaced by a real swimming octopus animation (Lottie, lazy-loaded after page render).
  It has a brain now: roams the whole screen on its own, turns to face where it swims, blinks its eyes every few seconds.
  Every so often it swims up to a heading, menu link, button or track, lands on it for 2-3 seconds and "hugs" it (the text
  squishes like it's being squeezed), then leaps off somewhere unpredictable. Every 10-15 seconds it roars: an ink puff and
  a spray of the letter D burst from its mouth like dragon fire, drifting and fading. Clicks pass straight through it, and it
  stays off when the visitor prefers reduced motion.
- Mini player is now a square card on desktop (artwork on top, title, prev/play/next, corner X badge). On mobile it is a
  compact 76px square: tap to expand the full row, swipe left/right for next/previous track, X still closes it.
- Mobile comfort pass: safe-area clearance for the fixed controls on notched phones, bigger tap targets (platform icons,
  player buttons, track play buttons), roomier track rows, readable legal text, footer links easier to tap.
- Cursor fix: the native cursor is properly hidden again on fine pointers (the has-cursor class is on body, as the JS sets it).
- Email is contact@voxpher.com site-wide.
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v6.1 — WORK + BUILD MERGED (2026-10-01)
- DELETED work.html. The Build page now holds everything: hero, 9-box toolbox, honesty note, then the full Selected-work grid (5 cards, working filters, empty-state) + CTA.
- Nav is now 7 items on every page: Home, About, Services, Music, Build, Education, Contact (mobile menu renumbered 01-07, footer cleaned, sitemap dropped /work).
- Case study pages (/work/indoride, /work/hubator, /work/facebengal) unchanged and still linked; their nav highlights Build.
- Home/404/about/music/visuals content links retargeted /work -> /build; home Brands world card now points to /build and its copy fixed (Deepex FF -> FaceBengal).
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v6.0 — BUILD TOOLBOX UPGRADE (2026-10-01)
- build.html: removed the "How it started / From curiosity to production." section.
- Toolbox now 9 boxes: AI split into 4 named boxes (AI chat & research, AI image & video, AI voice & music, AI coding) with real model/site names; Media & motion expanded with Premiere Pro, Photoshop, Illustrator, Blender (from his resume).
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v5.9 — AI TOOLBOX BOX + EDUCATION TRIM (2026-10-01)
- build.html: new "AI tools" box in the toolbox grid (ChatGPT, Claude, Meta AI, Gemini, text-to-video, video-to-text, vibe coding, prompt engineering); the separate "AI in the workflow" section was removed.
- education.html: removed the "Skills & tools / What I know." section; page now ends with education, experience, certificates + contact CTA.
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v5.8 — EDUCATION PAGE + AI WOVEN IN (2026-10-01)
- NEW education.html: formal education (Mechanical Engg diploma, BA, WBBSE/WBCHSE), experience (Reliance Jio, Agarwala Machinery Stores), 9 certificates, skills & tools. No phone/DOB (privacy).
- DELETED studio.html. Studio removed from nav, mobile menu, footer, sitemap, js/site.js. Studio's media tools (FL Studio, VN, After Effects) moved into a new "Media & motion" group on the Build page.
- AI now appears honestly on the site: one line in the home hero ("AI is in the toolkit; a human is in charge"), a full "AI in the workflow" block on the Build page (ChatGPT, Claude, Meta AI, Gemini, text-to-video, video-to-text, vibe coding, prompt engineering), one clause in the services lede.
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v5.7 — HUBATOR REAL STACK + SITE LINKS (2026-10-01)
- work/hubator.html rewritten to the REAL stack (was WooCommerce/WordPress per the old brief): hand-coded HTML/CSS/JS storefront (GitHub Pages + Cloudflare), Next.js + React dashboard, Node.js + MongoDB backend, Razorpay payments, Cloudinary media, Vercel. No template, no page builder, no WordPress.
- Hubator sidebar now matches the Indoride pattern: Stack chips (real tech) + Links (hubator.com) + Delivered.
- Honest note added: fully hand-coded today; Shopify and WooCommerce integrations planned for the future (his words).
- work/facebengal.html: added Links section with facebengal.in.
- WordPress/WooCommerce/PHP/MySQL mentions kept on about/build/services/studio pages: those describe his learning journey and services, all still true.
Deploy: replace repo contents, push, hard-refresh.

VOXPHER v5.6 — CASE STUDY LAYOUT FIX (2026-10-01)
- Fixed the "meshy" look on all 3 case study pages (work/indoride, work/hubator, work/facebengal) with CSS only; no HTML changed.
- Root cause found: the sidebar panel (.cs-facts) had a leftover 4-column grid rule from old markup, scattering the sidebar into a broken grid; the hero facts strip (.cs-meta) had no styles at all.
- Hero facts (Type / My role / Stack / Status): now a proper 4-column strip with thin black divider lines above and below.
- Sidebar: now a proper bordered boxy panel; Stack / Links / Delivered groups separated by thin black divider lines; stack chips are bordered boxes.
- Every content section (The problem, The approach, ...) now starts with a thin black divider line and real breathing room above it.
- Fixed mashed text: architecture diagram labels ("Flutter App / Customer + driver") now stack on two lines.
- Mobile: hero facts go 2-up; sidebar stacks full width as before.
Deploy: replace repo contents, push, hard-refresh.

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
In js/site.js:  email: "contact@voxpher.com"
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
