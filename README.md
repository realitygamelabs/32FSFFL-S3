# Survivor Fantasy Football — Season 3

This is the **simplified, chapter-first** microsite. It includes the original media index, the bundled confessional log, the season narrative, and the three supplied championship screenshots. No local video hosting or dependency installation required.

## Publish to GitHub Pages

1. Unzip the complete site into the **root** of your GitHub repository. Keep `index.html`, `app.js`, `styles.css`, `data/`, and `assets/` together.
2. Commit and push your changes in GitHub Desktop.
3. In GitHub **Settings → Pages**, deploy from `main` at `/ (root)`.
4. Once the deployment finishes, refresh the GitHub Pages address. You may need a hard refresh if your browser retained cached JavaScript or CSS.

To update an existing Season 3 repo, replacing the files at those same paths is enough. Unused files from older versions can be deleted; this site does not reference them.

## Archive format

- `data/phases.json`: 16 chapters; the final four original sections (jury, Week 14, Week 15, aftermath) have been consolidated into `finale`. Edit only the narrative fields for copy updates.
- `data/media.json`: 37 original recording links, grouped by `phaseId`, with the final jury voting recording assigned to `finale`.
- `data/confessionals.csv`: all 678 recording links, with player names and timestamps. The published CSV omits the source spreadsheet’s `Gist` column entirely; only player names, timestamps, and media URLs are included.
- `data/collections.json`: links to the original Google Drive folders and the public confessional spreadsheet.
- `assets/`: the three game-supplied championship screenshots plus the favicon.

The chapter picker controls **everything**: story, footage, and timestamped confessionals. There is no separate full-game media grid, separate confessional archive, or standalone championship section. The jury and fantasy results only appear in the final chapter.

## Editing and playback

Recording links lead to the original Google Drive files. Desktop users can try in-page playback in a responsive overlay; on mobile, opening Google Drive directly is recommended, with embedded playback still optional.

Finale scores are rounded from the original screenshots. The final three were Aly, Navi, and Steve; the final jury split was 5–3–0; Steve won on aggregate two-week fantasy points.

Some Tribal dates are inferred from the season's Tuesday schedule; exact recording times have not been verified. Videos remain hosted by their original owners, so viewers need sufficient sharing permissions.
