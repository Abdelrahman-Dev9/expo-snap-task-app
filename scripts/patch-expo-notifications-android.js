/**
 * Expo Go Android does not ship ExpoTopicSubscriptionModule. The stock
 * TopicSubscriptionModule.android.js throws on import and breaks any
 * expo-notifications consumer. Replace with a no-op stub (local reminders
 * do not need topic APIs). Metro also aliases this via metro.config.js.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-notifications",
  "build",
  "TopicSubscriptionModule.android.js",
);

const stub = `export default {
  subscribeToTopicAsync: undefined,
  unsubscribeFromTopicAsync: undefined,
};
`;

if (!fs.existsSync(target)) {
  process.exit(0);
}

fs.writeFileSync(target, stub);
console.log("Patched expo-notifications TopicSubscriptionModule.android.js");
