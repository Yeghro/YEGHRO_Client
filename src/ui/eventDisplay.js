import { setImageWithRetry } from "./index.js";

let eventsArray = [];
const metadataMap = new Map(); // Map to store metadata
const eventBuffer = []; // Buffer to store events temporarily

export function displayEvent(event) {
  // Buffer the event
  eventBuffer.push(event);
  checkAndRenderBufferedEvents();
}

export function storeMetadata(pubkey, metadata) {
  // Check if metadata already exists for the pubkey to avoid duplicates
  if (!metadataMap.has(pubkey)) {
    metadataMap.set(pubkey, metadata);
    console.log(`Stored metadata for pubkey ${pubkey}`);
  }
  // After storing metadata, try to render any buffered events
  checkAndRenderBufferedEvents();
}

function checkAndRenderBufferedEvents() {
  const remainingBuffer = [];
  eventBuffer.forEach((event) => {
    if (metadataMap.has(event.pubkey)) {
      eventsArray.push(event);
    } else {
      remainingBuffer.push(event);
    }
  });

  eventBuffer.length = 0; // Clear the buffer
  remainingBuffer.forEach((event) => eventBuffer.push(event)); // Re-buffer remaining events

  // Sort events by created_at in descending order
  eventsArray.sort((a, b) => b.created_at - a.created_at);

  // Render all events
  renderEvents();
}

function renderEvents() {
  const feed = document.getElementById("feed");

  // Clear the feed and re-display sorted events
  feed.innerHTML = "";

  eventsArray.forEach((event) => {
    const metadata = metadataMap.get(event.pubkey);
    const card = document.createElement("div");
    card.className = "card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header d-flex align-items-center";

    const profilePicture = document.createElement("img");
    profilePicture.className = "feed-profile-picture";

    const userInfo = document.createElement("div");
    userInfo.className = "user-info ml-2";

    const userName = document.createElement("span");
    userName.className = "user-name font-weight-bold";

    const postDate = document.createElement("span");
    postDate.className = "post-date text-muted ml-2";

    if (metadata) {
      let profileData;
      try {
        profileData = JSON.parse(metadata.content);
        console.log("Parsed metadata:", profileData);
      } catch (error) {
        console.error("Error parsing metadata:", error);
        profileData = {};
      }

      userName.textContent = profileData.name || event.pubkey;

      if (profileData.picture) {
        setImageWithRetry(profilePicture, profileData.picture);
      } else {
        profilePicture.src =
          "https://yeghro.site/wp-content/uploads/2024/03/nostr-300x300.webp"; // Set to a default or placeholder image
      }
    } else {
      userName.textContent = event.pubkey;
    }

    // Convert the timestamp to a readable date and time format
    const eventDate = new Date(event.created_at * 1000);
    postDate.textContent = eventDate.toLocaleString();

    const cardContent = document.createElement("div");
    cardContent.className = "card-content mt-2";

    // Handle event content
    // Check if content has image URLs
    if (event.content.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
      const contentUrls = event.content.split(/[\s,]+/);
      contentUrls.forEach((contentUrl) => {
        if (contentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
          const imageElement = document.createElement("img");
          imageElement.style.maxWidth = "100%"; // Set maximum width
          imageElement.style.maxHeight = "auto"; // Maintain aspect ratio
          setImageWithRetry(imageElement, contentUrl);
          cardContent.appendChild(imageElement);
        } else {
          const textElement = document.createElement("p");
          textElement.textContent = contentUrl;
          cardContent.appendChild(textElement);
        }
      });
    } else {
      // Handle plain text content
      const contentText = document.createElement("p");
      contentText.textContent = event.content;
      cardContent.appendChild(contentText);
    }

    cardHeader.appendChild(profilePicture);
    userInfo.appendChild(userName);
    userInfo.appendChild(postDate);
    cardHeader.appendChild(userInfo);
    card.appendChild(cardHeader);
    card.appendChild(cardContent);
    feed.appendChild(card);
  });
}
