# Multi-stage production build for the InterviewForge Next.js app.
# Build from the repo root: docker build -f docker/Dockerfile -t interviewforge .

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# --- deps: install dependencies with pnpm, cached separately from source ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: compile the Next.js production build --------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Only NEXT_PUBLIC_* values need to be present at build time (they're
# inlined into the client bundle); everything else is read at runtime.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm build

# --- runner: minimal runtime image using Next.js standalone output ---------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100
# Listen on all interfaces inside the container (required for Hostinger/Docker).
# This is NOT your public site URL — do not remove. Browser redirects use APP_URL
# / X-Forwarded-Host via lib/app-url.ts, not this value.
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3100

CMD ["node", "server.js"]
