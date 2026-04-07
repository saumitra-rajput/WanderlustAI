// public/js/ai.js
// Handles:
// 1. AI Travel Tips button on listing show page
// 2. Floating chat bubble available on all pages

// ─────────────────────────────────────────────────────────
// PART 1: AI Travel Tips (show.ejs)
// ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("ai-recommend-btn");

  if (btn) {
    const resultBox = document.getElementById("ai-result");
    const resultText = document.getElementById("ai-result-text");
    const loadingSpinner = document.getElementById("ai-loading");

    btn.addEventListener("click", async () => {
      const title = btn.dataset.title;
      const location = btn.dataset.location;
      const country = btn.dataset.country;
      const description = btn.dataset.description;
      const price = btn.dataset.price;

      btn.disabled = true;
      btn.innerText = "Getting Tips...";
      loadingSpinner.classList.remove("d-none");
      resultBox.classList.add("d-none");

      try {
        const response = await fetch("/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, location, country, description, price }),
        });

        const data = await response.json();

        if (data.success) {
          resultText.innerText = data.recommendations;
          resultBox.classList.remove("d-none");
        } else {
          resultText.innerText = "Sorry, could not get recommendations. Try again!";
          resultBox.classList.remove("d-none");
        }
      } catch (err) {
        resultText.innerText = "AI service unavailable. Please try again later.";
        resultBox.classList.remove("d-none");
      } finally {
        btn.disabled = false;
        btn.innerText = "✨ Get AI Travel Tips";
        loadingSpinner.classList.add("d-none");
      }
    });
  }
});

// ─────────────────────────────────────────────────────────
// PART 2: Floating Chat Bubble (all pages)
// ─────────────────────────────────────────────────────────

// Conversation history (kept in memory per session)
let chatHistory = [];

// Get listing context if on a listing show page
function getListingContext() {
  const btn = document.getElementById("ai-recommend-btn");
  if (!btn) return null;
  return {
    title: btn.dataset.title || null,
    location: btn.dataset.location || null,
    country: btn.dataset.country || null,
    description: btn.dataset.description || null,
    price: btn.dataset.price || null,
  };
}

// Toggle chat window open/close
function toggleChat() {
  const chatWindow = document.getElementById("chat-window");
  if (!chatWindow) return;

  const isHidden = chatWindow.classList.contains("d-none");
  if (isHidden) {
    chatWindow.classList.remove("d-none");
    document.getElementById("chat-input").focus();

    // If on a listing page, update welcome message with context
    const listing = getListingContext();
    if (listing && listing.title && chatHistory.length === 0) {
      const messages = document.getElementById("chat-messages");
      messages.innerHTML = `
        <div class="chat-msg ai-msg">
          👋 Hi! I'm your WanderLust travel assistant.<br><br>
          I can see you're looking at <strong>${listing.title}</strong> in ${listing.location}. 
          Ask me anything about this listing or general travel tips!
        </div>
      `;
    }
  } else {
    chatWindow.classList.add("d-none");
  }
}

// Add a message bubble to the chat window
function addMessage(text, role) {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `chat-msg ${role === "user" ? "user-msg" : "ai-msg"}`;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// Send message to /ai/chat
async function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const message = input.value.trim();

  if (!message) return;

  // Show user message
  addMessage(message, "user");
  input.value = "";
  sendBtn.disabled = true;

  // Show typing indicator
  const messages = document.getElementById("chat-messages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg typing-msg";
  typingDiv.innerText = "✦ Thinking...";
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  // Get listing context if available
  const listing = getListingContext();

  try {
    const response = await fetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: chatHistory,
        listing,
      }),
    });

    const data = await response.json();

    // Remove typing indicator
    typingDiv.remove();

    if (data.success) {
      // Add to history for context
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: data.response });

      // Keep history manageable (last 6 exchanges)
      if (chatHistory.length > 12) {
        chatHistory = chatHistory.slice(-12);
      }

      addMessage(data.response, "ai");
    } else {
      addMessage("Sorry, I couldn't process that. Please try again!", "ai");
    }
  } catch (err) {
    typingDiv.remove();
    addMessage("AI service is unavailable right now. Try again later!", "ai");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}
