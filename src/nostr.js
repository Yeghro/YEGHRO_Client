import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { showConnectionStatus } from "./ui.js";

let ndk;
let nip07signer;

async function initializeNDK() {
  nip07signer = new NDKNip07Signer({
    waitTimeout: 2000, // waitTimeout should be in milliseconds
  });

  ndk = new NDK({
    explicitRelayUrls: ["wss://nostrpub.yeghro.site"],
    signer: nip07signer,
    autoConnectUserRelays: false, // Ensure auto connect is enabled
    autoFetchUserMutelist: true, // Ensure auto fetch is enabled
  });

  // Set up event listeners for the NDK instance
  ndk.on("event", (event, relay) => {
    console.log("Received event:", event);
  });

  ndk.on("signer:ready", (signer) => {
    console.log("Signer is ready:", signer);
  });

  ndk.on("event:invalid-sig", (event) => {
    console.warn("Invalid signature for event:", event);
  });

  try {
    // Ensure the signer is ready and retrieve the user
    const user = await ndk.signer.blockUntilReady();
    console.log("User is ready:", user);

    // Manually set the NDK instance on the user object if necessary
    if (!user.ndk) {
      user.ndk = ndk;
    }

    // Set the active user
    ndk.activeUser = user;
    console.log("Active user set in NDK:", ndk.activeUser);

    // Connect to the Nostr relay using the NDK instance
    await ndk.connect();
    console.log("Connected to Nostr relay!");
    showConnectionStatus("Connected to Nostr relay!");

    // Fetch the active user's profile
    try {
      const profile = await user.fetchProfile();
      console.log("Active user's profile:", profile);
    } catch (profileError) {
      console.error("Error fetching profile:", profileError);
      showConnectionStatus("Error fetching profile");
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    showConnectionStatus("Error during initialization");
  }
}

export { initializeNDK };
