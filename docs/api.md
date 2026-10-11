# API contract

The template ships an OpenAPI 3.1 document generated from the same zod
schemas the routes validate against, so the spec and the server cannot
drift.

## Where things live

- Spec: `GET /api/openapi.json` (generated in `src/server/openapi.ts`)
- Swagger UI: `/docs` (renders the spec; assets load from unpkg, version
  pinned in `src/app/docs/route.ts`)
- Contract test: `src/server/openapi.test.ts` (part of `pnpm run check`)

## What the contract test proves

1. The document is valid OpenAPI 3.1 and lists every app route.
2. Every route handler under `src/app/api/**` plus `/health` is documented —
   adding a route without documenting it fails the check.
3. Every documented response matches what the real route handler returns:
   the test calls the handlers and parses the bodies with the documented
   schemas.
4. Type-level checks (`IsEqual` from type-fest) keep the zod-inferred types
   in sync with the documented shapes.

## Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/health` | GET | Liveness for load balancers and orchestrators |
| `/api/hello` | GET | Greeting demo (zod validation at the boundary) |
| `/api/challenge` | GET | Proof-of-work challenge |
| `/api/contact` | POST | Contact submission (gated) |
| `/api/feedback` | POST | Feedback -> GitHub issue (gated) |
| `/api/openapi.json` | GET | This spec |
| `/docs` | GET | Swagger UI |

`/api/auth/*` is managed by Better Auth and is not hand-documented here;
see the repo's auth documentation when auth is enabled.

## Why not JSON:API?

[JSON:API](https://jsonapi.org) is still maintained (spec v1.1) and is a
good fit for resource-oriented CRUD APIs with relationships, pagination,
and compound documents. This template's API surface is form submission
(contact, feedback) plus a few simple endpoints, where the JSON:API
envelope (`data`/`errors` wrappers, `application/vnd.api+json`) would add
ceremony without benefit. The template therefore uses plain JSON with an
OpenAPI contract. If a scaffolded project grows a resource API, adopt
JSON:API for that surface and keep this spec as the contract.

## Adding a route

1. Add the route handler under `src/app/api/`.
2. Add the path to `src/server/openapi.ts`, reusing the same zod schemas
   the handler validates against.
3. The contract test then proves the spec and the server agree.
