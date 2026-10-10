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
