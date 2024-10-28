/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  tailwind: true,
  postcss: true,
  browserNodeBuiltinsPolyfill: {
    modules: { http: true },
  },
  serverDependenciesToBundle: [/^swiper.*/],
};
