# Contributing to InterviewForge

Thanks for helping improve InterviewForge. This project is MIT-licensed and free to use.

## Development

1. Follow [docs/setup.md](./docs/setup.md) for local Supabase + `.env.local`.
2. Use `AI_PROVIDER=mock` and `VOICE_PROVIDER=mock` unless you are testing real providers.
3. Run `pnpm test:unit` before opening a PR.
4. Keep secrets out of commits — never commit `.env.local`.

## Pull requests

- Prefer small, focused PRs.
- Match existing TypeScript / layering rules (repositories vs services; no AI or service-role on the client).
- Update docs under `docs/` when behavior changes.

## Support the project

If InterviewForge helps you, you can [support development](https://rzp.io/rzp/1JaZann3) (donations help cover API and hosting costs for demos and maintenance).
