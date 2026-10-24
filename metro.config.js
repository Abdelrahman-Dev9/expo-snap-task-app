const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const topicStub = path.resolve(
  __dirname,
  "src/lib/stubs/TopicSubscriptionModule.android.js",
);

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "android" &&
    moduleName === "./TopicSubscriptionModule" &&
    typeof context.originModulePath === "string" &&
    context.originModulePath.includes(`${path.sep}expo-notifications${path.sep}`)
  ) {
    return { type: "sourceFile", filePath: topicStub };
  }

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
