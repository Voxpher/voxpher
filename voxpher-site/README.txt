================================================================
 VOXPHER — Creative Studio website (Papan Sutradhar)
 Rebuilt in the style of the reference site you sent.
================================================================

WHAT'S INSIDE (keep this exact folder structure):

  voxpher-site/
  ├── index.html          → the whole page (all text lives here)
  ├── css/
  │   └── style.css       → all design (colours, fonts, layout)
  ├── js/
  │   ├── images.js       → ★ CHANGE YOUR IMAGE URLS HERE ★
  │   └── main.js         → menu, animations, form (don't need to touch)
  └── README.txt          → this file

-----------------------------
1) CHANGE YOUR IMAGES (you asked for this)
-----------------------------
Open:  js/images.js

Every image on the site is listed there with a plain-English comment
(HERO, MENU OVERLAY, SERVICES, SELECTED WORK 1-5, DIVIDER, CONTACT 1-3).
Paste your own direct image link between the quotes, save, done.

  - Tall spots (hero, menu, services, divider, contact): use 3:4 images
  - Work cards (work1 … work5): use wide 4:3 images

-----------------------------
2) CHANGE TEXT / EMAILS / SOCIAL LINKS
-----------------------------
Open:  index.html   → all headlines, project names and paragraphs.
Search for  hello@voxpher.com  and replace with your real email
(2 places: contact button + footer).
Social links (Instagram, Behance, LinkedIn, X, YouTube) are in the
menu overlay and the footer — they point to "#" now; paste your real
profile links there.

-----------------------------
3) MAKE THE CONTACT FORM SEND YOU EMAILS
-----------------------------
Right now the form shows a "SENT" message but doesn't email anyone.
Free way to make it real (2 minutes):
  1. Go to https://formspree.io and create a free form — copy your
     form ID (looks like "xabc1234").
  2. In index.html find:  <form class="cform" id="contactForm" novalidate>
     Change it to:
     <form class="cform" id="contactForm" action="https://formspree.io/f/YOUR_ID" method="POST">
     (replace YOUR_ID with your form ID, and remove the word novalidate)
  3. In js/main.js delete the "contact form" block at the bottom
     (from the comment line to just before "loadImages();").
Done — messages will land in your inbox.

-----------------------------
4) PUT IT ONLINE (pick one)
-----------------------------
A) GitHub Pages (free): create a repo, upload ALL files keeping the
   folders, then Settings → Pages → Deploy from branch → main.
   Your site: https://YOURNAME.github.io/REPO/
B) Netlify (free): drag the whole voxpher-site folder onto
   https://app.netlify.com/drop — you get a live link instantly.
C) Vercel (free): "Add New → Project → upload" the folder.

No build step, no server needed — it's plain HTML/CSS/JS.

-----------------------------
5) PREVIEW ON YOUR COMPUTER FIRST
-----------------------------
Just double-click index.html — it opens in your browser.
(For the full effect, serve it: python3 -m http.server — then open
http://localhost:8000)

================================================================
Built by D for Papan Sutradhar · September 2026
================================================================
