const quoteText = document.querySelector(".quote"),
  quoteBtn = document.querySelector("button"),
  authorName = document.querySelector(".name"),
  speechBtn = document.querySelector(".speech"),
  copyBtn = document.querySelector(".copy"),
  twitterBtn = document.querySelector(".twitter"),
  favoriteBtn = document.querySelector(".favorite"),
  likedQuotesBtn = document.querySelector(".liked-quotes"),
  downloadBtn = document.querySelector(".download"),
  backArrow = document.querySelector(".back-arrow"),
  quotesList = document.querySelector(".quotes-list"),
  notificationArea = document.querySelector(".notification-area"),
  likedQuotesView = document.querySelector(".liked-quotes-view"),
  synth = speechSynthesis;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Show/hide main view and liked quotes view
function toggleViews(showLikedQuotes) {
  if (showLikedQuotes) {
    document.querySelector(".wrapper").style.display = "none";
    likedQuotesView.style.display = "block";
    renderLikedQuotes();
  } else {
    document.querySelector(".wrapper").style.display = "block";
    likedQuotesView.style.display = "none";
  }
}

// Render liked quotes list
function renderLikedQuotes() {
  quotesList.innerHTML = favorites.map((quote, index) => `
    <div class="quote-item" data-index="${index}">
      <div class="quote-text">"${quote.text}" - ${quote.author}</div>
      <div class="quote-actions">
        <i class="fas fa-trash delete-quote" title="Delete"></i>
        <i class="fas fa-download download-quote" title="Download"></i>
      </div>
    </div>
  `).join("");
}

function randomQuote() {
  quoteBtn.classList.add("loading");
  quoteBtn.innerText = "Loading Quote...";
  let url = "http://api.quotable.io/random";

  fetch(url).then(response => response.json()).then(result => {
    quoteText.innerText = result.content;
    authorName.innerText = result.author || "Anonymous";
    quoteBtn.classList.remove("loading");
    quoteBtn.innerText = "New Quote";
    
    // Update favorite button state for new quote
    const isFavorite = favorites.some(quote => 
      quote.text === result.content && quote.author === (result.author || "Anonymous")
    );
    favoriteBtn.classList.toggle("active", isFavorite);
  });
}

speechBtn.addEventListener("click", () => {
  if (!quoteBtn.classList.contains("loading")) {
    let utterance = new SpeechSynthesisUtterance(`${quoteText.innerText} by ${authorName.innerText}`);
    synth.speak(utterance);
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(`${quoteText.innerText} - ${authorName.innerText}`);
  showNotification("Quote copied to clipboard!");
});

twitterBtn.addEventListener("click", () => {
  let tweetUrl = `https://twitter.com/intent/tweet?text="${quoteText.innerText}" - ${authorName.innerText}`;
  window.open(tweetUrl, "_blank");
});

favoriteBtn.addEventListener("click", () => {
  const currentQuote = {
    text: quoteText.innerText,
    author: authorName.innerText,
  };
  if (favorites.some(quote => quote.text === currentQuote.text)) {
    favorites = favorites.filter(quote => quote.text !== currentQuote.text);
    favoriteBtn.classList.remove("active");
    showNotification("Quote removed from favorites!");
  } else {
    favorites.push(currentQuote);
    favoriteBtn.classList.add("active");
    showNotification("Quote added to favorites!");
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
});

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notificationArea.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function downloadQuote() {
  const blob = new Blob([`"${quoteText.innerText}" - ${authorName.innerText}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quote.txt';
  link.click();
  URL.revokeObjectURL(url);
  showNotification("Quote downloaded successfully!");
}

// Event listeners
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(`${quoteText.innerText} - ${authorName.innerText}`);
  showNotification("Quote copied to clipboard!");
});

likedQuotesBtn.addEventListener("click", () => {
  toggleViews(true);
});

backArrow.addEventListener("click", () => {
  toggleViews(false);
});

// Handle actions in liked quotes view
quotesList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-quote")) {
    const quoteItem = e.target.closest(".quote-item");
    const index = quoteItem.dataset.index;
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderLikedQuotes();
    showNotification("Quote removed from favorites!");
  }
  
  if (e.target.classList.contains("download-quote")) {
    const quote = e.target.closest(".quote-item").querySelector(".quote-text").textContent;
    const blob = new Blob([quote], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quote.txt';
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Quote downloaded successfully!");
  }
});

quoteBtn.addEventListener("click", randomQuote);
randomQuote();
