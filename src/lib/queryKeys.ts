export const queryKeys = {
  movies: {
    all: ['movies'] as const,
    detail: (id: number) => ['movie', id] as const,
    search: (q: string) => ['movies', 'search', q] as const,
    similar: (id: number) => ['movies', id, 'similar'] as const,
  },
  genres: ['genres'] as const,
  myList: (userId: number) => ['my-list', userId] as const,
};
