# Political Engagement on Social Media — coded survey prototype

This version is mapped to the supplied Google Forms PDF.

## Important design change
The Google Form uses branching based on political following. Each branch contains five social-media posts:

- BBM: 5 posts
- DDS: 5 posts
- Kakampink: 5 posts
- Neutral / No leaning: 5 posts

The coded survey keeps that branching logic but randomizes the **five posts within the selected branch** for each participant. The exact randomized order is stored in `postOrder`.

## How to run
1. Open this folder in VS Code.
2. Open `index.html` with Live Server, or double-click `index.html`.
3. Complete the prototype.
4. Open the browser developer console (F12 → Console) to see the final study data while `developmentMode` is true.

## Files you may edit
- `data.js` — study wording, options, stimulus list, and debrief text.
- `app.js` — survey behavior and flow.
- `style.css` — appearance.
- `randomization.js` — post randomization. Usually leave this alone.

## Before real data collection
The submission endpoint is intentionally blank and development mode is on. Do not collect real participant data until the researchers have tested the full flow, verified the ethics-approved wording/stimuli, and configured a secure data destination.

The raffle number is deliberately kept separate from the study response payload so the study data and raffle contact information can be handled independently.
