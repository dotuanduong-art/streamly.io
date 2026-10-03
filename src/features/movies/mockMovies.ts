import { Movie, Genre } from '@/types';

export const mockGenres: Genre[] = [
  { id: 1, name: 'Action', slug: 'action', movieCount: 14 },
  { id: 2, name: 'Sci-Fi', slug: 'sci-fi', movieCount: 10 },
  { id: 3, name: 'Drama', slug: 'drama', movieCount: 18 },
  { id: 4, name: 'Thriller', slug: 'thriller', movieCount: 12 },
  { id: 5, name: 'Comedy', slug: 'comedy', movieCount: 8 },
  { id: 6, name: 'Animation', slug: 'animation', movieCount: 9 },
  { id: 7, name: 'Adventure', slug: 'adventure', movieCount: 15 },
  { id: 8, name: 'Horror', slug: 'horror', movieCount: 7 },
];

const seedMovies: Movie[] = [
  {
    id: 1,
    title: 'Cyberpunk: Edgerunners & Beyond',
    overview: 'In a dystopic metropolis overflowing with corruption and cybernetic implants, a talented street kid striving to become a mercenary outlaw takes on high-stakes corporate espionage.',
    year: 2024,
    runtime: 148,
    rating: 8.9,
    isFeatured: true,
    isTrending: true,
    isNew: true,
    posterPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    trailerKey: null, // No verified trailer for this fixture
    director: 'Hiroyuki Imaishi',
    genres: [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Sci-Fi' },
      { id: 6, name: 'Animation' },
    ],
    cast: [
      { id: 101, name: 'Aoi Yuuki', character: 'Lucy' },
      { id: 102, name: 'KENN', character: 'David Martinez' },
      { id: 103, name: 'Hiroki Touchi', character: 'Maine' },
    ],
  },
  {
    id: 2,
    title: 'Interstellar Horizons',
    overview: 'When Earth becomes uninhabitable, a team of ex-NASA astronauts travels through a newly discovered wormhole in search of a new home for humanity across uncharted solar systems.',
    year: 2023,
    runtime: 169,
    rating: 8.7,
    isFeatured: false,
    isTrending: true,
    isNew: false,
    posterPath: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    trailerKey: 'zSWdZVtXT7E',
    director: 'Christopher Nolan',
    genres: [
      { id: 2, name: 'Sci-Fi' },
      { id: 3, name: 'Drama' },
      { id: 7, name: 'Adventure' },
    ],
    cast: [
      { id: 104, name: 'Matthew McConaughey', character: 'Cooper' },
      { id: 105, name: 'Anne Hathaway', character: 'Brand' },
      { id: 106, name: 'Jessica Chastain', character: 'Murph' },
    ],
  },
  {
    id: 3,
    title: 'The Dark Sentinel',
    overview: 'When a mysterious villain unleashes chaos across Gotham, a dark vigilant crimefighter must confront his deepest shadows to protect the city from utter annihilation.',
    year: 2024,
    runtime: 152,
    rating: 9.0,
    isFeatured: true,
    isTrending: true,
    isNew: true,
    posterPath: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    trailerKey: 'mqqft2x_Aa4',
    director: 'Matt Reeves',
    genres: [
      { id: 1, name: 'Action' },
      { id: 4, name: 'Thriller' },
      { id: 3, name: 'Drama' },
    ],
    cast: [
      { id: 107, name: 'Robert Pattinson', character: 'Bruce Wayne / Batman' },
      { id: 108, name: 'Zoe Kravitz', character: 'Selina Kyle' },
      { id: 109, name: 'Paul Dano', character: 'The Riddler' },
    ],
  },
  {
    id: 4,
    title: 'Neon Odyssey',
    overview: 'A rogue synth hunter uncovers a hidden secret buried beneath the neon rain of futuristic Tokyo that could unravel the fabric of human consciousness.',
    year: 2024,
    runtime: 135,
    rating: 8.4,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    posterPath: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80',
    trailerKey: 'gCcx85zbxz4',
    director: 'Denis Villeneuve',
    genres: [
      { id: 2, name: 'Sci-Fi' },
      { id: 4, name: 'Thriller' },
    ],
    cast: [
      { id: 110, name: 'Ryan Gosling', character: 'Officer K' },
      { id: 111, name: 'Ana de Armas', character: 'Joi' },
    ],
  },
  {
    id: 5,
    title: 'Shadow Realm Chronicles',
    overview: 'An ancient order of spellcasters battles shadowy extra-dimensional forces threatening to consume the mortal realm during a solar eclipse.',
    year: 2023,
    runtime: 142,
    rating: 7.9,
    isFeatured: false,
    isTrending: true,
    isNew: false,
    posterPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    trailerKey: 'LdOM0x0XD54',
    director: 'Guillermo del Toro',
    genres: [
      { id: 1, name: 'Action' },
      { id: 7, name: 'Adventure' },
    ],
    cast: [
      { id: 112, name: 'Benedict Cumberbatch', character: 'Sorcerer Supreme' },
      { id: 113, name: 'Elizabeth Olsen', character: 'Wanda' },
    ],
  },
  {
    id: 6,
    title: 'The Great Heist',
    overview: 'A team of master thieves plans an impossible breach into the most secure subterranean vault in Zurich to recover an irreplaceable artifact.',
    year: 2024,
    runtime: 128,
    rating: 8.2,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    posterPath: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&auto=format&fit=crop&q=80',
    trailerKey: 'YoHD9XEInc0',
    director: 'Steven Soderbergh',
    genres: [
      { id: 1, name: 'Action' },
      { id: 4, name: 'Thriller' },
      { id: 5, name: 'Comedy' },
    ],
    cast: [
      { id: 114, name: 'Brad Pitt', character: 'Rusty' },
      { id: 115, name: 'George Clooney', character: 'Danny' },
    ],
  },
];

const extraTitles = [
  'Beyond the Pines', 'Midnight Crossing', 'The Last Lighthouse', 'Paper Planets',
  'After the Rain', 'Wild Current', 'A Place to Begin', 'The Long Weekend',
  'Silent Orbit', 'Little Giants', 'The Hollow House', 'Northern Lights',
  'Run to the Sea', 'Second Chances', 'The Lost Expedition', 'Summer in Motion',
  'Echoes of Tomorrow', 'Under the Surface', 'City of Strangers', 'The Wild Ones',
  'Moonlight Express', 'Into the Blue', 'The Secret Garden', 'Final Transmission',
  'Bright Days', 'The Night Visitor',
];

// Deterministic fixtures with the same fields as backend movie responses.
export const mockMovies: Movie[] = Array.from({ length: 32 }, (_, index) => {
  const seed = seedMovies[index % seedMovies.length];
  const title = index < seedMovies.length ? seed.title : extraTitles[index - seedMovies.length];
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    ...seed,
    id: index + 1,
    title,
    overview: index < seedMovies.length ? seed.overview : `An unexpected discovery changes everything. Follow a remarkable journey through distant places, fragile friendships, and the choices that bring us home.`,
    genres: [mockGenres[index % 8], mockGenres[(index + 3) % 8]],
    posterPath: `https://picsum.photos/seed/${slug}/500/750`,
    backdropPath: `https://picsum.photos/seed/${slug}/1280/720`,
    trailerKey: index % 5 === 4 ? null : seed.trailerKey,
    isFeatured: index === 1 || index === 4,
    isTrending: index < 12,
    isNew: index >= 8 && index < 20,
  };
});
mockGenres.forEach((genre) => {
  genre.movieCount = mockMovies.filter((movie) => movie.genres.some((item) => item.id === genre.id)).length;
});

