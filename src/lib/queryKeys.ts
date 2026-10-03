export const queryKeys = {
  movies: {
    featured: ['movies', 'featured'] as const,
    trending: ['movies', 'trending'] as const,
    new: ['movies', 'new'] as const,
    genre: (id: number) => ['movies', 'genre', id] as const,
  },
  genres: ['genres'] as const,
};
