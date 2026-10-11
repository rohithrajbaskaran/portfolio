# Rohithraj Baskaran — Portfolio

Personal portfolio and blog. Plain HTML, CSS, and JavaScript: no build step, no dependencies.

## Structure

```
index.html                                  Home: hero, impact, about, experience, work, projects, writing, skills, contact
blog/index.html                             Writing index
blog/grc-beyond-checkbox-compliance.html    Blog post
css/styles.css                              All styles (light + dark themes)
js/main.js                                  Interactions (reveal, counters, ⌘K palette, theme, filters)
assets/                                     Résumé PDF and favicon
```

## Drive mode (`drive/`)

An interactive 3D version of the portfolio: drive a car around an island where every landmark is a section (experience, projects, writing, skills, contact). Built with Three.js (loaded from a CDN), still no build step.

- **Controls:** WASD / arrow keys, Space to drift, Shift to boost, M for the map, N for day/night, R to respawn. Phones get a joystick and boost button.
- **Extras:** collectible impact stats on the ring road, a wall of skill crates to smash, achievements, minimap, optional engine sound.
- **Deep links:** `drive/#itgc`, `drive/#plutus`, `drive/#contact`, etc. open the game parked at that landmark.
- **Content** lives in `drive/content.js`; the world and game logic are in `drive/game.js`.

## Quest mode (`quest/`)

A side-scrolling platformer version. Pick one of four original characters (Bo, Kai, Zap, Princess Blossom), each with their own ability, then hit **?** blocks and dive down pipes to open each section. Stomp bugs, break skill bricks, collect the impact-stat stars, and reach the flag to finish at the castle. All art is drawn in code; content is shared with `drive/content.js`.

- **Controls:** ← → move, Space jump, ↓ enter pipes, Shift ability, L level select. Phones get an on-screen pad.
- **Deep links:** `quest/#itgc`, `quest/#skills`, `quest/#contact`, etc. warp straight to a section.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy (GitHub Pages)

Push to `main`, then in the repo go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, `main`, `/ (root)`. The site will be live at `https://rohithrajbaskaran.github.io/portfolio/`.

## Adding a blog post

1. Copy `blog/grc-beyond-checkbox-compliance.html` to a new file and replace the article content.
2. Add a card for it in `blog/index.html` and in the Writing section of `index.html`.
3. Add it to the `commands` list in `js/main.js` so it shows up in the ⌘K palette.
