# Survivor Fantasy Football — Season 3

A static, GitHub Pages–ready season microsite. No server, account, build process, or JavaScript dependencies are needed.

## What's included

- **19 playable game chapters**, from the August 2025 draft, through Tribals, the merge, the final three jury, the two-week fantasy championship, and the December 2025 aftermath.
- **37 individually indexed Drive recordings** from `non confessional video assets.xlsx`:
  - 16 Tribal Councils (including split / special Tribals)
  - 1 final jury-vote recording
  - 3 reward / game-event videos
  - 6 Ponderosa videos
  - 11 produced episodes, ending with Harry's exit at final seven
- **678 player confessionals** from 22 people, with timestamp-based chapter assignment, name filter, sorting, search, direct playback links and 260 genuine gist entries. Bundled as `data/confessionals.csv` so the site works without Google Sheets access.
- Three supplied **fantasy-football final screenshots** and a clearly explained two-week championship: Aly 5 jury votes, Navi 3, Steve 0; Steve wins the fantasy final 369–354–302 (rounded), and the overall game.
- A direct link to the Winner's Circle podcast, but **no unverified or unrelated podcast episodes**.
- Mobile-first media viewer with **Open in Google Drive** as the reliable primary playback option, plus an optional embedded player.


## Small GitHub narrative update

For this balanced-narrative update ZIP, replace just these files in your existing repository:

- `data/phases.json` (the rewritten chapter stories)
- `README.md` (documentation)

Do not delete or replace the existing `assets/` folder, `data/media.json`, `data/confessionals.csv`, or `data/collections.json`. The chapter narratives use the existing media and confessional index. In GitHub Desktop, commit and push, then refresh GitHub Pages after deployment. The site already requests `data/phases.json` with cache revalidation. If the old copy is still displayed, hard-refresh after the deployment finishes.

## Deploy with GitHub Desktop

1. Create/open your **Survivor Fantasy Football S3** GitHub repository using GitHub Desktop.
2. In GitHub Desktop, select **Repository → Show in Finder** (or **Show in Explorer** on Windows).
3. Copy **all files and folders inside this extracted website folder** into the repository **root**, replacing existing files: `index.html`, `styles.css`, `app.js`, `data/`, `assets/`, and this README. You do not need to copy or upload the source Excel spreadsheets.
4. In GitHub Desktop, write a commit message such as `Complete Season 3 archive with Tribal videos and fantasy final`, then click **Commit to main**, then **Push origin**.
5. In GitHub on the repo, go to **Settings → Pages**, select **Deploy from a branch**, `main`, `/ (root)`, and Save.
6. After deployment, visit `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. If you already configured GitHub Pages, simply push and wait for Pages to redeploy.
7. If you see an older version, hard refresh (Mac `Cmd + Shift + R`, Windows `Ctrl + Shift + R`).

**Important:** GitHub Pages is ordinarily publicly accessible, even when media remains in Drive. Confirm the visibility of the original videos and confessionals before distributing this site.

## Data and editing

- `data/phases.json`: 19 story chapters, descriptions, date boundaries, jury outcome and final game result. Changing this file updates the chapter UI.
- `data/media.json`: all 37 individual recordings, with `category`, `phaseId`, title, verified Drive link, and descriptions; ordered by chapter. Individual video files are hosted in Drive, **not the Git repository**.
- `data/confessionals.csv`: 678 exact timestamped source entries. Blanks and placeholders in the `Gist` column are excluded.
- `data/collections.json`: original Google Drive collection links and the confessional Google Sheet.
- `assets/championship-*.png`: supplied fantasy football screenshots. Other graphics use lightweight HTML/CSS/SVG.

Edit the corresponding JSON entries to update dates, names or descriptions. If you add recordings, choose the matching `phaseId` from `data/phases.json` and one of the categories (`tribals`, `challenges`, `ponderosa`, `episodes`, `voting`). The site only indexes individual video URLs in `data/media.json`; the source Voting Confessionals folder remains linked as a collection until its individual files are supplied.

## Narrative revision and source boundaries

- Each of the 19 chapters now includes a more complete editorial recap, with **53 story sections** about the original three tribes, player perspectives, lineup strategy, Edge of Extinction, swaps, merge, late-game decisions, and championship.
- The primary timeline is based on the supplied recording inventory, produced-episode notes, dated confessionals, and final scoring images. Private conversations supplied by one participant were used only to contextualize certain events through the end of the game. No chat transcripts, direct quotes, or chat screenshots are distributed with this website; the single-person view is not treated as a full account of the cast’s strategy.
- **No WhatsApp messages, chat screenshots, chat text files, quotes, or names of private chat groups have been added as source assets**. The chapter prose is original narrative synthesis; existing player-submitted confessional gists remain separate from these chat sources.
- The final is presented as a factual conclusion rather than a victory lap.

## Timeline methodology / source limitations

- **The elimination sequence** is grounded in the organizer's `non confessional video assets.xlsx` descriptions (e.g., Will, Julia and Jason, Cody and Ross's departure, the Edge returns, the merge, Harry, Allix, Katie, and Joel). These are source descriptions, not independently confirmed transcriptions of each video.
- The organizer specified that Tribals generally happened weekly on **Tuesdays starting September 9, 2025**. Those are calendar-based **date assignments**, not verified file-recording dates. **Week 13A** is a documented special weekend Tribal; its date is tentatively assigned to November 29–December 1. **Week 13B** is tentatively December 2; the jury-vote chapter is tentatively December 3. Different actual timestamps can be corrected via `data/phases.json`.
- The last official **produced episode, Episode 11**, ends with **Harry's exit at final seven**. There is intentionally no manufactured produced episode for final six through the finish. The indexed raw Tribals and Ponderosa recordings provide endgame coverage.
- The indexed Tribal recordings do **not include the final-three Tribal with Steve, Aly, and Navi**. The spreadsheet does contain a separate **Final Tribal Council Votes** recording.
- **Final format / scores**: each juror vote assigns its recipient the juror's two best fantasy players for a two-week NFL Weeks 14–15 title game. Aly got 5 jury votes, Navi 3, Steve 0. The supplied screenshots show Steve finishing on about 369, Aly 354, Navi 302. Figures on the webpage are rounded for legibility. The screenshot originals are included unmodified.
- The organizer supplied a Spotify show URL but no verifiable list of **Season 3–specific episodes**; the website links to the show without treating its entire feed as Season 3 content.
- Attempts to open individual Google Drive files and the Spotify show from this environment did not expose playable media streams. **No claim is made that those recordings were watched or transcribed.** Their titles and contents are based on the provided file inventory and confessional gists.

## Local preview

Because the site fetches local JSON and CSV files, **double-clicking `index.html`** may not load dynamic content due to browser file restrictions. You can publish through GitHub Pages or run a simple local server from the site directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Source collections

- Tribal Councils: https://drive.google.com/drive/folders/1NJAp8rCErzmJTsnd_xtVZD-sU9EIl8CQ
- Voting Confessionals: https://drive.google.com/drive/folders/1UO90p2ypR8AkVN13VvVgnbAHxbM0S3Fc
- Rewards: https://drive.google.com/drive/folders/1DDfw-gKxr6zn2bV1Mf2XiFbgKtgW5YwO
- Ponderosa: https://drive.google.com/drive/folders/1UXO48jjG1KD4YZKphWd6zP-2k8P85dgo
- Produced Episodes: https://drive.google.com/drive/folders/1t_tt7TcUZGcI71vH4aTo9NIuf-nqePOT
- Confessionals: https://docs.google.com/spreadsheets/d/1HgUC_VY2PF-MvQ6gclII0GeMVvmWJ81z_7ul9eqw1n8
- Podcast: https://open.spotify.com/show/4i1Q3URl0U2S4MZho9Xllm
