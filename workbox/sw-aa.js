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
    "revision": "4261762e6c2b39caa727ff734d8c3826"
  },
  {
    "url": "img/15394230860042d5930e5b7.gif",
    "revision": "fea4e124a2422dab5b25cd17c9c8d402"
  },
  {
    "url": "img/img.png",
    "revision": "7d4fb9615ff227435497ec7323e57651"
  },
  {
    "url": "index.html",
    "revision": "a490afdbad4c6d46e4c239d6fdcf3deb"
  },
  {
    "url": "js/index.js",
    "revision": "f000abb6e3972c69f02ba765d640a659"
  },
  {
    "url": "sw-test.js",
    "revision": "2983f0c1564366d447aa97c1fd8730a2"
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
    "revision": "624944b52aae8d6e5499017323d8d6b2"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
