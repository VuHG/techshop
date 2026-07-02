# ---- Build: cài deps + build Next.js (NEXT_PUBLIC_* phải có lúc build) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# Biến công khai (browser dùng) — nướng vào bundle khi build.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AI_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AI_URL=$NEXT_PUBLIC_AI_URL
RUN npm run build

# ---- Run: chạy next start ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
