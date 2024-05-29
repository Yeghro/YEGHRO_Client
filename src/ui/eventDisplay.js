import { isValidURI } from "./utils.js";

export function displayEvent(event, metadata) {
  const feed = document.getElementById("feed");
  const eventElement = document.createElement("div");
  eventElement.className = "event";

  const authorElement = document.createElement("div");
  authorElement.className = "author";

  if (metadata) {
    let profileData;
    try {
      profileData = JSON.parse(metadata.content);
    } catch (error) {
      console.error("Error parsing metadata:", error);
      profileData = {};
    }

    authorElement.textContent = profileData.name || event.pubkey;

    if (profileData.picture) {
      try {
        const imgElement = document.createElement("img");
        if (isValidURI(profileData.picture)) {
          imgElement.src = profileData.picture;
          imgElement.style.maxWidth = "50px"; // Set maximum width
          imgElement.style.maxHeight = "50px"; // Set maximum height
          authorElement.appendChild(imgElement);
        } else {
          console.warn("Invalid image URI:", profileData.picture);
        }
      } catch (error) {
        console.error("Error with image URL:", error);
      }
    }

    if (profileData.nip05) {
      const nip05Element = document.createElement("span");
      nip05Element.textContent = ` (${profileData.nip05})`;
      authorElement.appendChild(nip05Element);
    }
  } else {
    authorElement.textContent = event.pubkey;
  }

  const contentElement = document.createElement("div");
  contentElement.className = "content";

  // Check if the event content contains an image URL
  if (event.content.match(/\.(jpeg|jpg|gif|png)$/)) {
    try {
      const imageElement = document.createElement("img");
      if (isValidURI(event.content)) {
        imageElement.src = event.content;
        imageElement.style.maxWidth = "500px"; // Set maximum width
        imageElement.style.maxHeight = "500px"; // Set maximum height
        contentElement.appendChild(imageElement);
      } else {
        console.warn("Invalid event image URI:", event.content);
      }
    } catch (error) {
      console.error("Error with event image URL:", error);
    }
  } else {
    contentElement.textContent = event.content;
  }

  eventElement.appendChild(authorElement);
  eventElement.appendChild(contentElement);
  feed.appendChild(eventElement);
}
