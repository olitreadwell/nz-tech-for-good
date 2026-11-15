# API contract

The template ships an OpenAPI 3.1 document. It is generated from the same zod schemas that the routes validate against. The spec and the server cannot drift.

## Where things live

- Spec: `GET /api/openapi.json` (generated in `src/server/openapi.ts`)
- Swagger interface: `/docs` (renders the spec. Assets load from unpkg, version pinned in `src/app/docs/route.ts`)
- Contract test: `src/server/openapi.test.ts` (part of `pnpm run check`)

## What the contract test proves

1. The document is valid OpenAPI 3.1 and lists every app route.
2. Every route handler under `src/app/api/**` plus `/health` is documented. Adding a route without documenting it fails the check.
3. Every documented response matches what the real route handler returns: the test calls the handlers and parses the bodies with the documented schemas.
4. Type-level checks (`IsEqual` from type-fest) keep the zod-inferred types in sync with the documented shapes.

## Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/health` | GET | Liveness for load balancers and orchestrators |
| `/api/hello` | GET | Greeting demo (zod validation at the boundary) |
| `/api/challenge` | GET | Proof-of-work challenge |
| `/api/contact` | POST | Contact submission (gated) |
| `/api/feedback` | POST | Feedback -> GitHub issue (gated) |
| `/api/openapi.json` | GET | This spec |
| `/docs` | GET | Swagger interface |

`/api/auth/*` is managed by Better Auth and is not hand-documented here. See the auth documentation for the repo when auth is enabled.

## Why not JSON:API?

[jsonapi.org](https://jsonapi.org) is still maintained at version 1.1. It fits interfaces that create, read, update, and delete resources. Those interfaces can have relationships, pagination, and groups of related documents. This template has form submission and a few simple endpoints.

The jsonapi.org envelope would add extra structure without benefit. It uses data and error wrappers plus the `application/vnd.api+json` media type. The template uses plain JSON with an OpenAPI contract instead. If a scaffolded project grows a resource interface, adopt the jsonapi.org specification for it. Keep this spec as the contract.

## Adding a route

1. Add the route handler under `src/app/api/`.
2. Add the path to `src/server/openapi.ts`, reusing the same zod schemas the handler validates against.
3. The contract test then proves the spec and the server agree.
