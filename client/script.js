import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// while chat AI is loading answer allow dots to appear to show it is loading
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    // if textContent has the value of 4 dots then restart the pocess and return to 0 so only a max of 3 dots show up
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// function allows AI answer to appear letter by letter
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for all messages to be able to map over them
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalSting = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalSting}`;
}

// function allows for a clear distinction between user's search and AI's answer
function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}"/>
          </div>
          <div class="message" id="${uniqueId}">${value}</div>
        </div>
      </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault(); // prevent page from reloading after submit

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // AI's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response
  const response = await fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompy"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit); // triggers handleSubmit function when you click submit
form.addEventListener("keyup", (e) => {
  // triggers handleSubmit function when you click enter on keyboard
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
