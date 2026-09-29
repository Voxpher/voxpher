/* ============================================================
   VOXPHER — site configuration
   EDIT THIS FILE to change images, email, socials, form.
   ------------------------------------------------------------
   IMAGES: replace any picsum URL with your own image URL.
   Keep the same shape (tall 3:4 for portraits, wide 16:9 or
   4:3 for cards/banners) so the layout stays intact.
   SOCIALS: paste ONLY real, verified profile URLs. Leave any
   platform empty ("") and it will simply not appear on the site.
   Never invent usernames.
   FORMSPREE: paste your Formspree endpoint to receive form
   messages by email. Until then, the form opens the visitor's
   email app addressed to you (nothing is lost, nothing is fake).
   ============================================================ */
var VOXPHER_CONFIG = {

  email: "hello@voxpher.com",

  formspreeEndpoint: "", // e.g. "https://formspree.io/f/abcdwxyz"

  socials: {
    instagram: "",
    youtube:   "",
    linkedin:  "",
    x:         "",
    behance:   ""
  },

  images: {
    /* ---------- HOME ---------- */
    signatureImg: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1790700990/SIgnn1.png", // your signature (Cloudinary, white-on-dark via CSS invert)
    worldMusic:   "https://picsum.photos/seed/voxmusic/800/1000",    // tall 4:5 card
    worldVisuals: "https://picsum.photos/seed/voxvisual/800/1000",  // tall 4:5 card
    worldCode:    "https://picsum.photos/seed/voxcode/800/1000",     // tall 4:5 card
    worldBrands:  "https://picsum.photos/seed/voxbrands/800/1000",  // tall 4:5 card

    /* ---------- WORK CARDS (wide 4:3) ---------- */
    workIndoride:   "https://picsum.photos/seed/voxindoride/800/600",
    workHubator:    "https://picsum.photos/seed/voxhubator/800/600",
    workNamaste:    "https://picsum.photos/seed/voxnamaste/800/600",
    workDeepex:     "https://picsum.photos/seed/voxdeepex/800/600",
    workFacebengal: "https://picsum.photos/seed/voxface/800/600",
    workPhoto:      "https://picsum.photos/seed/voxphoto/800/600",
    workSite:       "https://picsum.photos/seed/voxsite/800/600",

    /* ---------- CASE STUDIES ---------- */
    indorideHero:    "https://picsum.photos/seed/csindoride/1680/720",  // wide 21:9
    indorideGal1:   "https://picsum.photos/seed/csindoride1/800/500",  // wide 16:10
    indorideGal2:   "https://picsum.photos/seed/csindoride2/800/500",
    hubatorHero:    "https://picsum.photos/seed/cshubator/1680/720",
    hubatorGal1:    "https://picsum.photos/seed/cshubator1/800/500",
    hubatorGal2:    "https://picsum.photos/seed/cshubator2/800/500",
    namasteHero:    "https://picsum.photos/seed/csnamaste/1680/720",
    namasteGal1:    "https://picsum.photos/seed/csnamaste1/800/500",
    namasteGal2:    "https://picsum.photos/seed/csnamaste2/800/500",
    deepexHero:     "https://picsum.photos/seed/csdeepex/1680/720",
    deepexGal1:     "https://picsum.photos/seed/csdeepex1/800/500",
    deepexGal2:     "https://picsum.photos/seed/csdeepex2/800/500",
    facebengalHero: "https://picsum.photos/seed/csface/1680/720",
    facebengalGal1: "https://picsum.photos/seed/csface1/800/500",
    facebengalGal2: "https://picsum.photos/seed/csface2/800/500",

    /* ---------- MUSIC (tall portraits / wide banner) ---------- */
    musicHero:  "https://picsum.photos/seed/voxmusicher/800/1000",  // tall 4:5
    musicStage: "https://picsum.photos/seed/voxstage/1600/900",     // wide 16:9

    /* ---------- VISUALS GALLERY (mixed ratios, masonry) ---------- */
    vis1: "https://picsum.photos/seed/voxvis1/800/1000",
    vis2: "https://picsum.photos/seed/voxvis2/800/600",
    vis3: "https://picsum.photos/seed/voxvis3/800/1200",
    vis4: "https://picsum.photos/seed/voxvis4/800/800",
    vis5: "https://picsum.photos/seed/voxvis5/800/1000",
    vis6: "https://picsum.photos/seed/voxvis6/800/650",
    vis7: "https://picsum.photos/seed/voxvis7/800/1100",
    vis8: "https://picsum.photos/seed/voxvis8/800/750",
    vis9: "https://picsum.photos/seed/voxvis9/800/1000",

    /* ---------- ABOUT / STUDIO ---------- */
    studioImg:     "https://picsum.photos/seed/voxstudio/800/1000"  // tall 4:5
  }
};
