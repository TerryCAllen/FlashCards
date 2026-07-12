(function () {
  "use strict";

  var CARD_FILE = "cards.txt";

  var deck = [];       // [{ a, b }]
  var order = [];      // indices into deck for the current pass
  var passPos = 0;     // how many cards consumed from the current pass
  var history = [];    // [{ cardIndex, side }] every slide displayed
  var pos = -1;        // current index into history

  var cardText = document.getElementById("card-text");
  var shuffleIndicator = document.getElementById("shuffle-indicator");
  var shuffleTimer = null;

  // Turn inline "\n" and "<br>" / "<br/>" markers into real line breaks.
  function applyLineBreaks(text) {
    return text.replace(/<br\s*\/?>/gi, "\n").replace(/\\n/g, "\n").trim();
  }

  function parseCards(raw) {
    var cards = [];
    var lines = raw.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === "#") continue;
      var idx = line.indexOf(":");
      if (idx === -1) continue;
      var a = applyLineBreaks(line.slice(0, idx));
      var b = applyLineBreaks(line.slice(idx + 1));
      if (a && b) cards.push({ a: a, b: b });
    }
    return cards;
  }

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

  // Pull the next card index from the current pass, reshuffling when a pass ends.
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
    var text = entry.side === "a" ? card.a : card.b;
    cardText.textContent = text;
    cardText.classList.toggle("side-a", entry.side === "a");
  }

  function next() {
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
    var entry = history[pos];
    entry.side = entry.side === "a" ? "b" : "a";
    render();
  }

  function start() {
    // Fresh session on every load / refresh.
    order = [];
    for (var i = 0; i < deck.length; i++) order.push(i);
    passPos = 0;
    history = [];
    pos = -1;
    next();
  }

  function bindControls() {
    document.getElementById("btn-prev").addEventListener("click", prev);
    document.getElementById("btn-next").addEventListener("click", next);
    document.getElementById("btn-flip").addEventListener("click", flip);

    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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
      }
    });
  }

  function showError(message) {
    cardText.textContent = message;
    cardText.classList.remove("side-a");
  }

  fetch(CARD_FILE, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (raw) {
      deck = parseCards(raw);
      if (deck.length === 0) {
        showError("No cards found in " + CARD_FILE + ".");
        return;
      }
      bindControls();
      start();
    })
    .catch(function () {
      showError("Could not load " + CARD_FILE + ". Serve this folder over http (e.g. GitHub Pages).");
    });
})();
