# Contact and feedback

Every scaffolded project gets contact, feedback, and help-center mechanisms
out of the box. Abuse protection is on by default and costs humans almost
nothing.

## Endpoints

| Route | Purpose |
| --- | --- |
| `/contact` | Contact form -> project inbox |
| `/feedback` | Feedback form -> labelled GitHub issue |
| `/help` | Help center / FAQ |
| `/api/challenge` | Proof-of-work challenge (GET) |
| `/api/contact` | Contact submission (POST) |
| `/api/feedback` | Feedback submission (POST) |
| `/.well-known/feedback.json` | Machine-readable contract (static) |

## Abuse protection

Every submission must pass three gates before it is processed:

1. **Proof of work.** `GET /api/challenge` returns
   `{ challengeId, noncePrefix, difficulty }`. The client finds a `nonce`
   such that `sha256(noncePrefix + nonce)` hex starts with `difficulty`
   zeros (default 4, about 65k hashes — milliseconds for a browser, seconds
   of wasted effort per spam attempt). Challenges expire after 5 minutes
   and are single-use.
2. **Rate limit.** Per-IP fixed window, default 10 submissions/hour
   (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`). Blocked requests answer 429
   with `Retry-After`.
3. **Honeypot.** A hidden `website` field that bots fill and humans never
   see; any value rejects the submission silently.

Limiter and challenge store are in-memory: single-instance deploys only.
Multi-instance setups should rate limit at a proxy and share the challenge
store.

## Contact delivery

Set `CONTACT_TO` to the project inbox (default pattern:
`<app>-contact@ot.mozmail.com`). With `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/
`SMTP_PASS` configured, the form emails the inbox via nodemailer. Without
SMTP, the form still validates and gates, then opens a `mailto:` link.

## Feedback -> GitHub issues

Set `GH_TOKEN` (a token with `issues:write`) and `GH_REPO` (`owner/repo`) to
enable issue creation. Submissions:

- pick the label by type: `bug`, `enhancement`, or `question`;
- include full context: title, description, steps, expected/actual, page,
  user agent, app version, timestamp, repo;
- get created against the GitHub issues API with the
  `application/vnd.github+json` media type.

When disabled, the form still validates and explains where to go instead.

## The agent contract

The feedback path is deliberately AI-readable so agents can file issues the
same way humans do:

1. `GET /.well-known/feedback.json` — discover endpoints and the PoW spec.
2. `GET /api/challenge` — obtain `{ challengeId, noncePrefix, difficulty }`.
3. Compute `nonce` by brute force (SHA-256, leading zeros).
4. `POST /api/feedback` with the form fields plus `challengeId` and `nonce`.

The same applies to `/api/contact`. Agents include the same detail a careful
human would: repro steps, expected vs actual, environment, page. Never
include secrets in an issue.

## Privacy

Collected context: submitted fields, page URL, user agent, timestamp.
Issues on public repos are public. Do not submit credentials, tokens, or
personal data into either form.
