import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { showConnectionStatus } from "./ui.js";

export let ndk; // Module-level variable for NDK instance
export let nip07signer; // Module-level variable for the signer

export async function initializeNDK() {
  if (ndk) {
    console.log("NDK instance already initialized");
    return ndk;
  }

  nip07signer = new NDKNip07Signer({
    waitTimeout: 2000, // waitTimeout should be in milliseconds
  });

  ndk = new NDK({
    explicitRelayUrls: ["wss://nostrpub.yeghro.site"],
    signer: nip07signer,
    autoConnectUserRelays: false, // Manually handle user relays connection
    autoFetchUserMutelist: true, // Ensure auto fetch is enabled
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

      // Fetch the active user's follow list
      const follows = await user.follows();
      console.log("Active user's follows:", follows);
    } catch (profileError) {
      console.error("Error fetching profile or follows list:", profileError);
      showConnectionStatus("Error fetching profile or follows list");
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    showConnectionStatus("Error during initialization");
  }

  return ndk;
}
