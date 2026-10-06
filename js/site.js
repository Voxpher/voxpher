/* ============================================================
   VOXPHER site configuration
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

  email: "contact@voxpher.com",

  formspreeEndpoint: "", // e.g. "https://formspree.io/f/abcdwxyz"

  socials: {
    facebook:  "https://www.facebook.com/voxpher/", // <-- paste your Facebook profile URL between the quotes
    instagram: "https://www.instagram.com/voxpher/",
    x:         "https://www.x.com/voxpher", // <-- paste your X profile URL between the quotes
    youtube:   "https://www.youtube.com/@VoxpherOfficial",
    github:    "https://www.github.com/voxpher", // <-- paste your GitHub profile URL between the quotes
    linkedin:  "https://www.linkedin.com/in/voxpher"  // <-- paste your LinkedIn profile URL between the quotes
  },

  images: {
    /* HOW TO ADD YOUR IMAGES: paste your Cloudinary URL between the quotes.
       That's it — the site auto-optimizes it (right size, best format).
       You never need to resize anything yourself. */
    /* ---------- BRAND ---------- */
    logoImg: "https://res.cloudinary.com/hsv6zyuu/image/upload/w_1200,q_auto,f_auto/v1790700990/SIgnn1.png", // website logo: header + footer signature
    portrait: "https://res.cloudinary.com/hsv6zyuu/image/upload/w_1200,q_auto,f_auto/v1790700990/papa.png",
    /* ---------- HOME ---------- */
    worldMusic:   "https://res.cloudinary.com/hsv6zyuu/image/upload/w_1200,q_auto,f_auto/v1791130390/Musics.jpg",
    worldVisuals: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791132694/visualimage.jpg",
    worldCode:    "https://res.cloudinary.com/hsv6zyuu/image/upload/w_1200,q_auto,f_auto/v1791130976/pexels-code-1839406.jpg",
    worldBrands:  "https://res.cloudinary.com/hsv6zyuu/image/upload/w_1200,q_auto,f_auto/v1791131159/rupong_man_stand_black.jpg",

    /* ---------- WORK CARDS (wide 4:3) ---------- */
    workIndoride:   "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791261984/Indoride_cover.png",
    workHubator:    "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791261982/Hubator_cover.png",
    workFacebengal: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791261982/facebengal_cover.png",
    workPhoto:      "https://picsum.photos/seed/voxphoto/800/600",

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

    /* ---------- VISUALS GALLERY (mixed ratios, masonry) ----------
       Paste an image OR a video URL (.mp4/.webm/.mov) — videos autoplay muted.
       Every item shows at its natural ratio, never stretched. */
    vis1: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791264057/Ant_Thanks_to_skyviksigni_Clicked_with_75mm_macro_lense---Click_and_editing_by_voxpher---.jpg",
    vis2: "https://res.cloudinary.com/hsv6zyuu/video/upload/v1791264060/The_flowers_are_blooming_the_preparations_have_begun_October_filling_the_air._%EF%B8%8F-_Durga_Puja.mp4",
    vis3: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791264058/Found_beauty_in_the_calm_-_stones_that_hold_stories_streets_that_hold_memories._Some_places_ju.webp",
    vis4: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791264058/Found_beauty_in_the_calm_-_stones_that_hold_stories_streets_that_hold_memories._Some_places_ju_2.webp",
    vis5: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791264057/Bachpan_Jab_Zimmedari_Uthata_Hai_--_voxpher--_NA_NA_MAI_NAI_HU_responsibility_love_life.webp",
    vis6: "https://res.cloudinary.com/hsv6zyuu/video/upload/v1791264554/Kalipujashot.mp4",
    vis7: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791267268/Eyes_that_hold_a_thousand_untold_stories._Sometimes_the_quietest_moments_speak_the_loudest._-.webp",
    vis8: "https://res.cloudinary.com/hsv6zyuu/video/upload/v1791267567/deepexvideo.mp4",
    vis9: "https://res.cloudinary.com/hsv6zyuu/image/upload/v1791264057/%E0%A6%98%E0%A6%B0%E0%A7%87_%E0%A6%AB%E0%A7%87%E0%A6%B0%E0%A6%BE_%E0%A6%A4%E0%A7%8B%E0%A6%AE%E0%A6%BE%E0%A6%B0_%E0%A6%85%E0%A6%AD%E0%A7%8D%E0%A6%AF%E0%A7%87%E0%A6%B8_%E0%A6%A8%E0%A7%87%E0%A6%87_%EF%B8%8F--_voxpher--_warm_love_beautiful_sun_sky_sunset_hot_voxphe.webp",

    /* ---------- ABOUT ---------- */
  }
};