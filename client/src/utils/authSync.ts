/**
 * Utility to synchronize login and logout events across multiple browser tabs.
 */

export const broadcastAuthEvent = (
  type: "LOGIN" | "LOGOUT",
  extra?: { user?: any; accessToken?: string }
) => {
  if (typeof window === "undefined") return;

  const dataPayload = {
    type,
    user: extra?.user,
    accessToken: extra?.accessToken,
    timestamp: Date.now(),
  };
  const payloadStr = JSON.stringify(dataPayload);

  // 1. Broadcast via localStorage to trigger native 'storage' events in all OTHER tabs
  try {
    localStorage.setItem("auth_event", payloadStr);
  } catch (e) {
    // Ignore storage quota/security errors
  }

  // 2. Broadcast via BroadcastChannel API for ultra-fast tab communication
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("auth_channel");
      channel.postMessage(dataPayload);
      channel.close();
    }
  } catch (e) {
    // Ignore channel errors
  }
};
