import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Movie from "../models/Movie.js";

dotenv.config();

// ---------------------------------------------------------------------------
// This seeds a 100-title synthetic catalog purely to stress-test the UI with
// realistic volume (row scrolling, grids, search, genre spread). Poster and
// banner art come from Picsum's seeded endpoint (https://picsum.photos/seed/x)
// — a stable placeholder CDN that doesn't hotlink-block and needs no API key
// or valid photo IDs, so nothing here can 404 like the earlier YouTube
// thumbnails did. The art is unrelated to each title's content on purpose.
// Video playback uses Google's public sample-video bucket (the same
// Blender Foundation shorts used before), cycled across all 100 entries.
// ---------------------------------------------------------------------------

const SAMPLE_VIDEOS = [
  "BigBuckBunny",
  "ElephantsDream",
  "ForBiggerBlazes",
  "ForBiggerEscape",
  "ForBiggerFun",
  "ForBiggerJoyrides",
  "ForBiggerMeltdowns",
  "Sintel",
  "SubaruOutbackOnStreetAndDirt",
  "TearsOfSteel",
  "VolkswagenGTIReview",
  "WeAreGoingOnBullrun",
  "WhatCarCanYouGetForAGrand",
].map((name) => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`);

const ADJECTIVES = [
  "Silent", "Crimson", "Broken", "Eternal", "Hidden", "Lost", "Golden",
  "Shattered", "Velvet", "Iron", "Neon", "Frozen", "Sacred", "Wild", "Last",
];

const NOUNS = [
  "Horizon", "Kingdom", "Shadow", "Empire", "Journey", "Legacy", "Rebellion",
  "Symphony", "Odyssey", "Paradox", "Sanctuary", "Requiem", "Mirage",
  "Vortex", "Covenant",
];

const GENRE_POOL = [
  "Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Thriller",
  "Documentary", "Animation", "Fantasy", "Mystery", "Adventure", "Crime",
  "Family", "Musical",
];

const CAST_POOL = [
  "Maya Ortiz", "Daniel Cho", "Elena Vasquez", "Marcus Webb", "Aiko Tanaka",
  "Noah Bennett", "Priya Sharma", "Lucas Ferreira", "Freya Larsen",
  "Idris Mensah", "Clara Dubois", "Ravi Kapoor", "Sofia Marchetti",
  "Jonas Berg", "Amara Okafor",
];

const MATURITY_RATINGS = ["G", "PG", "PG-13", "R", "TV-14", "TV-MA"];

const GENRE_BLURB = {
  Action: "a relentless chain of high-stakes confrontations",
  Comedy: "a string of escalating misunderstandings played for laughs",
  Drama: "a quiet unraveling of family loyalty and regret",
  "Sci-Fi": "a fractured timeline that threatens the fabric of reality",
  Horror: "a presence that refuses to stay buried",
  Romance: "two strangers whose paths keep colliding against the odds",
  Thriller: "a conspiracy that reaches further than anyone expected",
  Documentary: "an unflinching look at a world rarely seen up close",
  Animation: "a hand-crafted world where anything can happen",
  Fantasy: "a realm on the edge of ancient, forgotten magic",
  Mystery: "a disappearance that doesn't add up",
  Adventure: "a journey across terrain no map fully explains",
  Crime: "a heist that was never as clean as it looked",
  Family: "a summer that changes everything for one household",
  Musical: "a story told as much through song as through words",
};

const slugify = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const buildMovie = (i) => {
  const adj = ADJECTIVES[i % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(i / ADJECTIVES.length) % NOUNS.length];
  const title = `${adj} ${noun}`;
  const slug = slugify(title) + `-${i}`;

  const primaryGenre = GENRE_POOL[i % GENRE_POOL.length];
  const secondaryGenre = GENRE_POOL[(i + 5) % GENRE_POOL.length];
  const genre = primaryGenre === secondaryGenre ? [primaryGenre] : [primaryGenre, secondaryGenre];

  const type = i % 7 === 0 ? "series" : "movie";
  const releaseYear = 1995 + ((i * 7) % 30);
  const rating = Math.round((5.5 + ((i * 13) % 45) / 10) * 10) / 10;
  const durationMinutes = type === "series" ? 22 + (i % 6) * 6 : 88 + (i % 9) * 7;
  const maturityRating = MATURITY_RATINGS[i % MATURITY_RATINGS.length];

  const cast = [
    CAST_POOL[i % CAST_POOL.length],
    CAST_POOL[(i + 4) % CAST_POOL.length],
    CAST_POOL[(i + 9) % CAST_POOL.length],
  ];

  return {
    title,
    description: `${title} follows ${genre.join(" and ").toLowerCase()} threads through ${GENRE_BLURB[primaryGenre]}.`,
    genre,
    releaseYear,
    maturityRating,
    durationMinutes,
    posterUrl: `https://picsum.photos/seed/${slug}/500/750`,
    bannerUrl: `https://picsum.photos/seed/${slug}/1280/720`,
    videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
    isFeatured: i % 12 === 0,
    isTrending: i % 5 === 0,
    type,
    cast,
    rating,
  };
};

const movies = Array.from({ length: 100 }, (_, i) => buildMovie(i));

const seed = async () => {
  await connectDB();
  try {
    await Movie.deleteMany();
    await Movie.insertMany(movies);
    const featuredCount = movies.filter((m) => m.isFeatured).length;
    const trendingCount = movies.filter((m) => m.isTrending).length;
    const seriesCount = movies.filter((m) => m.type === "series").length;
    console.log(`Seeded ${movies.length} titles.`);
    console.log(`  featured: ${featuredCount}, trending: ${trendingCount}, series: ${seriesCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
