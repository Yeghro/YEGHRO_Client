import { isValidURI } from "./utils.js";

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
    try {
      const img = document.createElement("img");
      if (isValidURI(profileData.picture)) {
        img.src = profileData.picture;
        img.style.maxWidth = "150px"; // Set maximum width
        img.style.maxHeight = "150px"; // Set maximum height
        pictureElement.appendChild(img);
      } else {
        console.warn("Invalid profile image URI:", profileData.picture);
      }
    } catch (error) {
      console.error("Error with profile image URL:", error);
    }
  }

  profileElement.appendChild(authorElement);
  profileElement.appendChild(nameElement);
  profileElement.appendChild(aboutElement);
  profileElement.appendChild(pictureElement);
  feed.appendChild(profileElement);
}
