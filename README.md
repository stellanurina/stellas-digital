# stellas.digital

Websites and WhatsApp AI assistants for Indonesian small businesses.

## How it works

All words and prices live in **`content.json`**. A small build script turns it into the Bahasa Indonesia site (`dist/`, the main site) and the English site (`dist/en/`), including the answers for the chat assistant.

```
content.json   ← edit this: copy, prices, case studies, FAQ, chat answers
build.js       ← turns content.json into pages (no need to edit)
src/           ← styles, scripts, images and favicons, copied into dist/ as they are
dist/          ← the finished website (created by the build, not stored in Git)
```

## Making changes

- **Change a price:** edit the number in `prices`, for example `"starter": 3000000`. The pricing page, the home page and the chat answers all update.
- **Edit text:** every piece of text is an `{"en": "...", "id": "..."}` pair. Change both languages.
- **Use a price inside text:** write `{p:starter}` and it becomes `Rp 3.000.000`.
- **Add a case study:** add an entry to `cases` and put its screenshot at `src/images/work/<slug>.webp`.
- **Add a chat answer:** add an entry to `chat.answers` with keywords in both languages.

## Building

```
npm run build
```

Needs Node.js 18 or newer. There are no packages to install.

## Hosting on Hostinger

Import this repository as a Node.js web app with:

- **Build command:** `build`
- **Output directory:** `dist`
- **Node.js version:** 20 or newer

With auto-deployment on, every commit to `main` rebuilds and publishes the site.
