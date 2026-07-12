(function () {
  "use strict";

  var MANIFEST = "decks.txt";
  var DECK_DIR = "decks/";

  var decks = [];     // [{ name, file }]
  var deck = [];      // current deck cards: [{ a, b }]
  var order = [];     // indices into deck for the current pass
  var passPos = 0;    // cards consumed from the current pass
  var history = [];   // [{ cardIndex, side }] every slide displayed
  var pos = -1;       // current index into history
  var inStudy = false;

  var deckListView = document.getElementById("deck-list");
  var deckButtons = document.getElementById("deck-buttons");
  var studyView = document.getElementById("study-view");
  var deckNameEl = document.getElementById("deck-name");
  var cardText = document.getElementById("card-text");
  var shuffleIndicator = document.getElementById("shuffle-indicator");
  var shuffleTimer = null;

  // ---------- parsing ----------
  function applyLineBreaks(text) {
    return text.replace(/<br\s*\/?>/gi, "\n").replace(/\\n/g, "\n").trim();
  }

  function splitOnFirstColon(line) {
    var idx = line.indexOf(":");
    if (idx === -1) return null;
    return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
  }

  function eachDataLine(raw, fn) {
    var lines = raw.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === "#") continue;
      fn(line);
    }
  }

  function parseCards(raw) {
    var cards = [];
    eachDataLine(raw, function (line) {
      var parts = splitOnFirstColon(line);
      if (!parts) return;
      var a = applyLineBreaks(parts[0]);
      var b = applyLineBreaks(parts[1]);
      if (a && b) cards.push({ a: a, b: b });
    });
    return cards;
  }

  function parseManifest(raw) {
    var list = [];
    eachDataLine(raw, function (line) {
      var parts = splitOnFirstColon(line);
      if (!parts) return;
      var name = parts[0];
      var file = parts[1];
      if (name && file) list.push({ name: name, file: file });
    });
    return list;
  }

  // ---------- card engine ----------
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }

  function flashShuffle() {
    shuffleIndicator.classList.add("flash");
    if (shuffleTimer) clearTimeout(shuffleTimer);
    shuffleTimer = setTimeout(function () {
      shuffleIndicator.classList.remove("flash");
    }, 900);
  }

  function randomSide() {
    return Math.random() < 0.5 ? "a" : "b";
  }

  function drawNextCard() {
    if (passPos >= order.length) {
      shuffle(order);
      passPos = 0;
      flashShuffle();
    }
    var cardIndex = order[passPos];
    passPos++;
    return cardIndex;
  }

  function render() {
    var entry = history[pos];
    var card = deck[entry.cardIndex];
    cardText.textContent = entry.side === "a" ? card.a : card.b;
    cardText.classList.toggle("side-a", entry.side === "a");
  }

  function next() {
    if (history.length === 0) return;
    if (pos < history.length - 1) {
      pos++;
    } else {
      var cardIndex = drawNextCard();
      history.push({ cardIndex: cardIndex, side: randomSide() });
      pos++;
    }
    render();
  }

  function prev() {
    if (pos > 0) {
      pos--;
      render();
    }
  }

  function flip() {
    if (history.length === 0) return;
    var entry = history[pos];
    entry.side = entry.side === "a" ? "b" : "a";
    render();
  }

  // Reset tracking and show the first card for the current deck.
  function startDeck() {
    order = [];
    for (var i = 0; i < deck.length; i++) order.push(i);
    passPos = 0;
    history = [];
    pos = -1;
    next();
  }

  // ---------- views ----------
  function showDeckList() {
    inStudy = false;
    studyView.hidden = true;
    deckListView.hidden = false;
  }

  function showStudy() {
    deckListView.hidden = true;
    studyView.hidden = false;
    inStudy = true;
  }

  function selectDeck(entry) {
    deckNameEl.textContent = entry.name;
    cardText.textContent = "Loading…";
    cardText.classList.remove("side-a");
    showStudy();
    fetch(DECK_DIR + entry.file, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (raw) {
        deck = parseCards(raw);
        if (deck.length === 0) {
          history = [];
          pos = -1;
          cardText.textContent = "No cards found in " + entry.file + ".";
          cardText.classList.remove("side-a");
          return;
        }
        startDeck();
      })
      .catch(function () {
        history = [];
        pos = -1;
        cardText.textContent = "Could not load " + entry.file + ".";
        cardText.classList.remove("side-a");
      });
  }

  function renderDeckList() {
    deckButtons.textContent = "";
    if (decks.length === 0) {
      var empty = document.createElement("p");
      empty.className = "deck-empty";
      empty.textContent = "No decks listed in " + MANIFEST + ".";
      deckButtons.appendChild(empty);
      return;
    }
    decks.forEach(function (entry) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "deck-btn";
      btn.textContent = entry.name;
      btn.addEventListener("click", function () { selectDeck(entry); });
      deckButtons.appendChild(btn);
    });
  }

  // ---------- controls ----------
  function bindControls() {
    document.getElementById("btn-prev").addEventListener("click", prev);
    document.getElementById("btn-next").addEventListener("click", next);
    document.getElementById("btn-flip").addEventListener("click", flip);
    document.getElementById("btn-decks").addEventListener("click", showDeckList);

    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (!inStudy) {
        var n = parseInt(e.key, 10);
        if (!isNaN(n) && n >= 1 && n <= decks.length) {
          e.preventDefault();
          selectDeck(decks[n - 1]);
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          prev();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          next();
          break;
        case "ArrowUp":
        case "ArrowDown":
        case "w":
        case "W":
        case "s":
        case "S":
          e.preventDefault();
          flip();
          break;
        case "Escape":
          e.preventDefault();
          showDeckList();
          break;
      }
    });
  }

  // ---------- init ----------
  bindControls();

  fetch(MANIFEST, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (raw) {
      decks = parseManifest(raw);
      renderDeckList();
      showDeckList();
    })
    .catch(function () {
      deckButtons.textContent = "";
      var msg = document.createElement("p");
      msg.className = "deck-empty";
      msg.textContent = "Could not load " + MANIFEST + ". Serve this folder over http (e.g. GitHub Pages).";
      deckButtons.appendChild(msg);
      showDeckList();
    });
})();
