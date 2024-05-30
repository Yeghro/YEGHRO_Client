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

export function displayActiveUserProfile(metadata, followCount) {
  const profileInfo = document.getElementById("profileInfo");
  const profilePicture = document.getElementById("profilePicture");
  const userName = document.getElementById("userName");
  const followCountElement = document.getElementById("followCount");

  if (!metadata) {
    console.error("No metadata provided for active user profile display.");
    return;
  }

  let profileData;
  try {
    profileData = JSON.parse(metadata.content);
  } catch (error) {
    console.error("Error parsing active user profile metadata:", error);
    profileData = {};
  }

  if (profileData.picture) {
    profilePicture.src = profileData.picture;
  } else {
    profilePicture.src = ""; // Default or placeholder image
  }

  userName.textContent = profileData.name || "No Name Provided";
  followCountElement.textContent = `Follows: ${followCount || 0}`;

  profileInfo.style.display = "block"; // Show the profile info section
}
