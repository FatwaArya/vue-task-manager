# Deploy to Render

## One service (Node) serving API + static frontend

1. Create a new Web Service on Render
   - Repository: this repo
   - Root directory: /
   - Runtime: Node
   - Build Command: `pnpm install --frozen-lockfile && pnpm build`
   - Start Command: `pnpm start`

2. Environment
   - Set `NODE_VERSION` to 20
   - Optionally set `VITE_API_BASE` if using an external API

3. Notes
   - The server serves built files from `dist` and exposes API under `/api`.
   - SPA fallback is enabled.

## Alternative: two services

- Static Site (Vite build output)
  - Build Command: `pnpm install --frozen-lockfile && pnpm build:web`
  - Publish Directory: `dist`
  - Add a rewrite rule `/* -> /index.html`

- Web Service for API
  - Start Command: `pnpm dev:api`
  - Set `CORS` allowed origins accordingly

# vue-task-manager

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
