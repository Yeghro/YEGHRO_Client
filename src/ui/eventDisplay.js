import { isValidURI } from "./utils.js";

let eventsArray = [];
let displayedEvents = 0;
const BATCH_SIZE = 100;
const metadataMap = new Map(); // Map to store metadata

export function displayEvent(event) {
  // Add event to the array
  eventsArray.push(event);

  // Sort events by created_at in descending order
  eventsArray.sort((a, b) => b.created_at - a.created_at);

  // Render events if they are within the current batch
  renderEvents();
}

export function storeMetadata(pubkey, metadata) {
  if (!metadataMap.has(pubkey)) {
    metadataMap.set(pubkey, metadata);
    console.log(`Stored metadata for pubkey ${pubkey}`);
  } else {
    console.log(`Metadata for pubkey ${pubkey} already exists`);
  }
}

function renderEvents() {
  const feed = document.getElementById("feed");

  // Display only the events that are within the current batch
  const eventsToDisplay = eventsArray.slice(0, displayedEvents + BATCH_SIZE);

  // Clear the feed and re-display sorted events
  feed.innerHTML = "";

  eventsToDisplay.forEach((event) => {
    const metadata = metadataMap.get(event.pubkey);
    const card = document.createElement("div");
    card.className = "card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";

    const profilePicture = document.createElement("img");
    profilePicture.className = "profile-picture";

    const userInfo = document.createElement("div");
    userInfo.className = "user-info";

    const userName = document.createElement("span");
    userName.className = "user-name";

    const postDate = document.createElement("span");
    postDate.className = "post-date";

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
        try {
          const imageUrl = profileData.picture;
          if (
            isValidURI(imageUrl) &&
            (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
          ) {
            profilePicture.src = imageUrl;
          } else {
            console.warn("Invalid image URI:", imageUrl);
            profilePicture.src = ""; // Set to a default or placeholder image
          }
        } catch (error) {
          console.error("Error with image URL:", error);
          profilePicture.src = ""; // Set to a default or placeholder image
        }
      }
    } else {
      userName.textContent = event.pubkey;
    }

    // Convert the timestamp to a readable date and time format
    const eventDate = new Date(event.created_at * 1000);
    postDate.textContent = eventDate.toLocaleString();

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    // Check if the event content contains an image URL
    const contentUrl = event.content;
    if (contentUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
      try {
        if (
          isValidURI(contentUrl) &&
          (contentUrl.startsWith("http://") ||
            contentUrl.startsWith("https://"))
        ) {
          const imageElement = document.createElement("img");
          imageElement.src = contentUrl;
          imageElement.style.maxWidth = "100%"; // Set maximum width
          imageElement.style.maxHeight = "auto"; // Maintain aspect ratio
          cardContent.appendChild(imageElement);
        } else {
          console.warn("Invalid event image URI:", contentUrl);
        }
      } catch (error) {
        console.error("Error with event image URL:", error);
      }
    } else {
      cardContent.textContent = event.content;
    }

    cardHeader.appendChild(profilePicture);
    userInfo.appendChild(userName);
    userInfo.appendChild(postDate);
    cardHeader.appendChild(userInfo);
    card.appendChild(cardHeader);
    card.appendChild(cardContent);
    feed.appendChild(card);
  });

  // Update the displayedEvents counter
  displayedEvents += BATCH_SIZE;
}

function fetchNextBatch() {
  // Check if all events are already loaded
  if (displayedEvents >= eventsArray.length) {
    return;
  }

  // Render the next batch of events
  renderEvents();
}

// Attach scroll event listener to the feed
const feed = document.getElementById("feed");
feed.addEventListener("scroll", () => {
  if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight) {
    fetchNextBatch();
  }
});
