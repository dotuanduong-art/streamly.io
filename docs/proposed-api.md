# PROPOSED — NOT AGREED WITH BACKEND

These endpoints are frontend proposals for Auth and My List. They do not exist in the current backend contract.

## Auth

- `POST /auth/register` with `{ email, password, displayName? }` → `201 AuthResponse`
- `POST /auth/login` with `{ email, password }` → `200 AuthResponse`

```ts
type AuthResponse = { accessToken: string; user: User };
type User = { id: number; email: string; displayName: string; avatarUrl?: string | null; role: 'User' | 'Admin' };
```

Expected errors: `400` validation, `401` invalid credentials, `403` forbidden, `409` duplicate email.

## My List

- `GET /my-list` → `200 Movie[]`
- `POST /my-list` with `{ movieId: number }` → `204`
- `DELETE /my-list/{movieId}` → `204`

All My List endpoints require `Authorization: Bearer <accessToken>`.

Error bodies use `{ message }`. Validation errors use `{ message, errors: Record<string, string[]> }`.
