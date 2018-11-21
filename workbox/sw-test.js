/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "css/index.css",
    "revision": "8f57a79ad7f2434a8610f3bf515803c2"
  },
  {
    "url": "img/img.png",
    "revision": "1bf2ae046a72729aa6a2eb8a1e4b4197"
  },
  {
    "url": "index.html",
    "revision": "2d032145a81da66aec7e33d466726caf"
  },
  {
    "url": "js/index.js",
    "revision": "398b60f0144ea07ec2d4cec3eb82a487"
  },
  {
    "url": "sw.js",
    "revision": "c159db999e5da18c7490f853b058b84f"
  },
  {
    "url": "test.html",
    "revision": "d683a6e884b2bb8b0c6d3362b3c022d6"
  },
  {
    "url": "test.js",
    "revision": "741b05dac5eb7e322e52bdf2ab94d127"
  },
  {
    "url": "workbox-config.js",
    "revision": "da183a050bb5f55cb2575e9ee4df1471"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
