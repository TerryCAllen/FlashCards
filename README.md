# Flash Cards

A dead-simple, dependency-free flash card app that works on phone and desktop.
Plain HTML, CSS, and vanilla JavaScript — no build step, no modules.

## Use it

Open the app and it immediately shows a card — a random side of the first card,
no welcome screen. Three large buttons sit at the bottom:

| Button | Action | Keys |
| ------ | ------ | ---- |
| Left   | Previous card | `←` or `A` |
| Middle | Flip side A / side B | `↑` `↓` or `W` `S` |
| Right  | Next card (random side) | `→` or `D` |

The deck plays through in order the first time. Once you reach the end it
reshuffles and a shuffle icon briefly flashes in the top-left so you know you
made it through the whole list. Every card you view is tracked so the back
button always works; refreshing the page starts a fresh session.

## Editing the cards

All content lives in [`cards.txt`](cards.txt), one card per line:

```
side a: side b
```

- Text before the first colon is **side A** (shown bold).
- Text after the first colon is side B (regular weight).
- Blank lines and lines starting with `#` are ignored.
- Need a line break inside a card? Use `\n` or `<br/>`.

Example:

```
Rectitude: Doing what is right regardless of the consequences.
Courage: Inner strength to resist opposition.
Three Levels:\nHigh\nMedium\nLow
```

## Running locally

Because the app loads `cards.txt` with `fetch`, browsers block it when you open
`index.html` directly from disk (`file://`). Serve the folder over http instead:

```
python -m http.server 8000
```

Then visit <http://localhost:8000>. On GitHub Pages it just works — enable Pages
for the repo and open the published URL on your phone or computer.
