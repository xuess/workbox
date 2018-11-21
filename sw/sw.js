
const CACHE_VERSION = 'test-cache-v3';
// // 监听 service worker 的 install 事件
this.addEventListener('install', function (event) {
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open(CACHE_VERSION).then(function (cache) {
            // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
            return cache.addAll([
                '/',
                '/index.html',
                '/index.css',
                '/index.js',
                '/img.png'
            ]);
        })
    );
});


this.addEventListener('fetch', function (event) {
    //接着调用 event 上的 respondWith() 方法来劫持我们的 HTTP 响应，然后自由更新他们
    event.respondWith(
        // caches.match(event.request) 允许我们对网络请求的资源和 cache 里可获取的资源进行匹配，查看是否缓存中有相应的资源
        caches.match(event.request).then(function (response) {

            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {

                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果就好了。。
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }

                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open(CACHE_VERSION).then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return httpRes;
            });
        })
    );
});

// // 安装阶段跳过等待，直接进入 active  开发环境
self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        Promise.all([

            // 更新客户端
            self.clients.claim(),

            // 清理旧版本
            caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (cacheName) {
                        if (cacheName !== CACHE_VERSION) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});