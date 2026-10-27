# My site

A multi-page React site built with Vite and published on GitHub Pages.

## First-time setup on GitHub

1. Create a new repository on GitHub and upload all these files (including the hidden `.github` folder).
2. In the repository, go to **Settings → Pages**, and under **Build and deployment → Source** choose **GitHub Actions**.
3. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish (about 1–2 minutes).
4. Your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

## Adding a new page

1. Save the new `.jsx` file in `src/pages/` (e.g. `HabitTracker.jsx`). It must contain `export default function ...`.
2. Open `src/pagesList.js` and add one entry: title, path, description, tags, keywords, date and component.
3. Push to GitHub. The page appears on the home page, in the menu, in the tag filter and in Ctrl/Cmd+K search automatically.

## Running it on your computer (optional)

Install Node.js from nodejs.org, then in this folder run:

```
npm install
npm run dev
```

Open the address it shows (usually http://localhost:5173).
