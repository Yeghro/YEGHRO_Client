export function displayActiveUserProfile(metadata, followCount) {
  const profileInfo = document.getElementById("profileInfo");
  const profilePicture = document.getElementById("profilePicture");
  const userName = document.getElementById("userName");
  const followCountElement = document.getElementById("followCount");
  const welcomeMessage = document.querySelector(".sidebar h2");
  const loginButton = document.getElementById("loginButton");
  const clickBelowMsg = document.querySelector(".sidebar p");

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
    profilePicture.src =
      "https://yeghro.site/wp-content/uploads/2024/03/nostr-300x300.webp"; // Default or placeholder image
  }

  // Set the default image if the provided picture fails to load
  profilePicture.onerror = function () {
    this.src =
      "https://yeghro.site/wp-content/uploads/2024/03/nostr-300x300.webp"; // Default image URL
  };

  userName.textContent = profileData.name || "No Name Provided";
  followCountElement.textContent = `Follows: ${followCount || 0}`;

  profileInfo.style.display = "block"; // Show the profile info section

  // Hide welcome message and login button
  welcomeMessage.style.display = "none";
  loginButton.style.display = "none";
  clickBelowMsg.style.display = "none";
}
