import NDK, { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";

const nip07signer = new NDKNip07Signer({
  waitTimeout: 2000, // waitTimeout should be in milliseconds
});

const ndk = new NDK({
  explicitRelayUrls: ["wss://nostrpub.yeghro.site"],
  signer: nip07signer,
  autoConnectUserRelays: false,
});

async function connectToRelay() {
  try {
    const user = await nip07signer.blockUntilReady();
    console.log("User is ready:", user);

    await ndk.connect();
    console.log("Connected to Nostr relay!");
  } catch (error) {
    console.error("Error during connection:", error);
  }
}

async function createAndSignEvent(kind, tags, content) {
  try {
    const user = await nip07signer.user();
    const event = {
      kind: kind,
      pubkey: user.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: content,
    };

    const signedEvent = await nip07signer.sign(event);
    console.log("Event signed:", signedEvent);

    return signedEvent;
  } catch (error) {
    console.error("Error creating or signing event:", error);
  }
}

ndk.on("event", (event, relay) => {
  console.log("Received event:", event);
});

ndk.on("signer:ready", (signer) => {
  console.log("Signer is ready:", signer);
});

ndk.on("event:invalid-sig", (event) => {
  console.warn("Invalid signature for event:", event);
});

async function initializeSigner() {
  try {
    const user = await nip07signer.blockUntilReady();
    console.log("Signer is ready:", user);
    return user;
  } catch (error) {
    console.error("Error waiting for signer:", error);
  }
}

async function getUser() {
  try {
    const user = await nip07signer.user();
    console.log("NDKUser retrieved:", user);
    return user;
  } catch (error) {
    console.error("Error retrieving user:", error);
  }
}

async function setActiveUser() {
  try {
    const user = await getUser();
    ndk.activeUser = user;
    console.log("Active user set in NDK:", ndk.activeUser);
  } catch (error) {
    console.error("Error setting active user:", error);
  }
}

// Initialize and connect to relay
initializeSigner().then(() => connectToRelay());

// Create and sign an event can be called in the future
// Example usage: createAndSignEvent(1, [], "Hello, Nostr!");
