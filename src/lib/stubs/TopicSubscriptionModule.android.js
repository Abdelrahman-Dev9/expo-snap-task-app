/**
 * Expo Go (and some hosts) ship expo-notifications without
 * ExpoTopicSubscriptionModule. The real module throws on import and takes
 * down any screen that loads expo-notifications. We only use local
 * scheduling APIs, so a no-op stub is safe.
 */
export default {
  subscribeToTopicAsync: undefined,
  unsubscribeFromTopicAsync: undefined,
};
