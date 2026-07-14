# Flash Cards

A dead-simple, dependency-free flash card app that works on phone and desktop.
Plain HTML, CSS, and vanilla JavaScript — no build step, no modules.

## Use it

On load (or refresh) the app shows a **deck picker**. Tap a deck to start
studying it — the first card appears immediately as a *question*, showing just
one side.

You study by cycling **question → answer → next question**. Two large buttons
sit at the bottom:

| Button | Action | Keys |
| ------ | ------ | ---- |
| Left   | Previous card (rewind) | `←` or `A` |
| Right  | Reveal the answer, then go to the next card | `→` or `D` |

Pressing the right button on a question **reveals the answer** — both sides at
once, side A on top (bold), a divider, then side B below. Press it again to
advance to the next card's question. On desktop you can also toggle the answer
on and off with `↑` `↓` or `W` `S`.

At the top right, an **A / B / ⇄** toggle chooses which side shows first on each
question: side A, side B, or a random side. It defaults to **A** and your choice
is remembered between visits.

Tap the deck name at the top (or press `Esc`) to return to the deck picker. On
the picker, number keys `1`–`9` jump straight into a deck.

The deck plays through in order the first time. Once you reach the end it
reshuffles and a shuffle icon briefly flashes in the top-left so you know you
made it through the whole list. Every card you view is tracked so the back
button always works; refreshing the page starts a fresh session.

## Decks

Each deck is a plain text file in the [`decks/`](decks/) folder. The list of
decks lives in [`decks.txt`](decks.txt) at the root, one per line:

```
Display Name: filename.txt
```

For example:

```
754: 754.txt
BJJ History: bjj-history.txt
```

**To add a deck:** drop a new `.txt` file into `decks/`, then add one line to
`decks.txt` mapping a display name to that filename.

## Card format

Every deck file uses the same format — one card per line, with side A and
side B separated by a colon `:` or a semicolon `;` (whichever comes first):

```
side a: side b
side a ; side b
```

- Text before the first separator is **side A** (shown bold).
- Text after it is side B (regular weight).
- Blank lines and lines starting with `#` are ignored.
- Need a line break inside a card? Use `\n` or `<br/>`.

Tip: use `;` for question/answer decks where the answer might contain a colon.

Example:

```
Rectitude: Doing what is right regardless of the consequences.
Who won UFC 1? ; Royce Gracie.
Three Levels:\nHigh\nMedium\nLow
```

## Running locally

Because the app loads the deck files with `fetch`, browsers block it when you
open `index.html` directly from disk (`file://`). Serve the folder over http
instead — for example with any static server:

```
python -m http.server 8000
```

Then visit <http://localhost:8000>. On GitHub Pages it just works — enable Pages
for the repo and open the published URL on your phone or computer.
