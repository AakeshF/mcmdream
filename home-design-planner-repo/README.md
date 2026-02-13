# ◈ Home Design Planner — MCM Edition

Interactive room-by-room design planner for a 3,129 sq ft mid-century modern home.
Built with React + Vite, hosted on GitHub Pages.

## Features

- **Room-by-room planning** — every room from the floor plan with dimensions and square footage
- **MCM color palettes** — 8 curated mid-century modern palettes (Warm Walnut, Atomic Ranch, etc.)
- **Design themes** — Classic MCM, MCM + Japandi, MCM + Industrial, and more
- **Furniture tracker** — mark pieces as owned/needed, builds a shopping list automatically
- **Vision & notes** — per-room text fields for inspiration and practical notes
- **Overview dashboard** — see all rooms at a glance with status, palette, and progress
- **localStorage persistence** — your selections save between sessions
- **Mobile responsive** — works on phone, tablet, and desktop

## Quick Start (Local Dev)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173/home-design-planner/`

## Deploy to GitHub Pages

### First time setup:

1. Create a new repo on GitHub called `home-design-planner`

2. Push this code:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/home-design-planner.git
git push -u origin main
```

3. Deploy:
```bash
npm run deploy
```

4. In your GitHub repo → Settings → Pages → Source should be set to `gh-pages` branch

5. Your site will be live at:
```
https://YOUR_USERNAME.github.io/home-design-planner/
```

### Updating:

After making changes:
```bash
git add .
git commit -m "update description"
npm run deploy
```

## Customization

### Change the repo name
If you use a different repo name, update `base` in `vite.config.js`:
```js
base: '/your-repo-name/',
```

### Reset data
Use the "Reset All Data" button in the Overview tab, or clear localStorage in your browser's dev tools.

### Add rooms
Edit the `ROOMS` object in `src/App.jsx`.

### Add palettes
Edit the `MCM_PALETTES` object in `src/App.jsx`.

---

Built with React 18 + Vite 5. No backend required.
