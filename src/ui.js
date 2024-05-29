export function setupLoginButton(clickHandler) {
  document
    .getElementById("loginButton")
    .addEventListener("click", clickHandler);
}

export function showConnectionStatus(status) {
  const statusElement = document.getElementById("connectionStatus");
  if (!statusElement) {
    const newStatusElement = document.createElement("p");
    newStatusElement.id = "connectionStatus";
    newStatusElement.textContent = status;
    document.body.appendChild(newStatusElement);
  } else {
    statusElement.textContent = status;
  }
}

export function displayEvent(event) {
  const feed = document.getElementById("feed");
  const eventElement = document.createElement("div");
  eventElement.className = "event";

  const authorElement = document.createElement("div");
  authorElement.className = "author";
  authorElement.textContent = event.pubkey;

  const contentElement = document.createElement("div");
  contentElement.className = "content";

  // Check if the event content contains an image URL
  if (event.content.match(/\.(jpeg|jpg|gif|png)$/)) {
    const imageElement = document.createElement("img");
    imageElement.src = event.content;
    imageElement.style.maxWidth = "500px"; // Set maximum width
    imageElement.style.maxHeight = "500px"; // Set maximum height
    contentElement.appendChild(imageElement);
  } else {
    contentElement.textContent = event.content;
  }

  eventElement.appendChild(authorElement);
  eventElement.appendChild(contentElement);
  feed.appendChild(eventElement);
}

export function displayProfile(event) {
  console.log("Profile Event content:", event.content); // Log the profile event content

  // Parse the profile content assuming it is JSON
  let profileData;
  try {
    profileData = JSON.parse(event.content);
  } catch (error) {
    console.error("Error parsing profile event content:", error);
    return;
  }

  const feed = document.getElementById("feed");
  const profileElement = document.createElement("div");
  profileElement.className = "profile";

  const authorElement = document.createElement("div");
  authorElement.className = "author";
  authorElement.textContent = event.pubkey;

  const nameElement = document.createElement("div");
  nameElement.className = "name";
  nameElement.textContent = profileData.name || "No Name Provided";

  const aboutElement = document.createElement("div");
  aboutElement.className = "about";
  aboutElement.textContent = profileData.about || "No About Information";

  const pictureElement = document.createElement("div");
  pictureElement.className = "picture";
  if (profileData.picture) {
    const img = document.createElement("img");
    img.src = profileData.picture;
    img.style.maxWidth = "150px"; // Set maximum width
    img.style.maxHeight = "150px"; // Set maximum height
    pictureElement.appendChild(img);
  }

  profileElement.appendChild(authorElement);
  profileElement.appendChild(nameElement);
  profileElement.appendChild(aboutElement);
  profileElement.appendChild(pictureElement);
  feed.appendChild(profileElement);
}
