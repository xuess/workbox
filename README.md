
## service worker

### service worker 是什么

W3C 组织早在 2014 年 5 月就提出过 Service Worker 这样的一个 HTML5 API ，主要用来做持久的离线缓存。


### Service Worker 功能与特点 


- 一个独立的 worker 线程，独立于当前网页进程，有自己独立的 worker context。
- 一旦被 install，就永远存在，除非被手动 unregister
- 用到的时候可以直接唤醒，不用的时候自动睡眠
- 可编程拦截代理请求和返回，缓存文件，缓存的文件可以被网页进程取到（包括网络离线状态）
- 离线内容开发者可控
- 能向客户端推送消息
- 不能直接操作 DOM
- 必须在 HTTPS 环境下才能工作
- 异步实现，内部大都是通过 Promise 实现
- 不能有同步操作

### 浏览器支持情况

[caniuse](https://caniuse.com/#search=service%20worker)

[更详细的兼容api列表](https://jakearchibald.github.io/isserviceworkerready/)

[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

    
### 怎么使用 Service Worker

前提条件

- Service Worker 要求 HTTPS 的环境 ，或者本地环境，host 为 localhost 或者 127.0.0.1 
- Service Worker 的缓存机制是依赖 Cache API
- 依赖 HTML5 fetch API
- 依赖 Promise

#### 注册

html页面引入
 ```js
 if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (registration) {
                // 注册成功
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function (err) {
                // 注册失败:(
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
 
 ```
 
 
#### 安装

```js
// 监听 service worker 的 install 事件
self.addEventListener('install', function (event) {
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    // ExtendableEvent.waitUntil()  方法——这会确保Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open('my-test-cache-v1').then(function (cache) {
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
```


####  自定义请求的响应

每次任何被 service worker 控制的资源被请求到时，都会触发 fetch 事件，这些资源包括了指定的 scope 内的文档，和这些文档内引用的其他任何资源（比如 index.html 发起了一个跨域的请求来嵌入一个图片，这个也会通过 service worker 。）

```js
self.addEventListener('fetch', function (event) {
//接着调用 event 上的 respondWith() 方法来劫持我们的 HTTP 响应，然后自由更新他们
    event.respondWith(
    // caches.match(event.request) 允许我们对网络请求的资源和 cache 里可获取的资源进行匹配，查看是否缓存中有相应的资源
        caches.match(event.request).then(function (response) {
            // 来来来，代理可以搞一些代理的事情

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
                caches.open('my-test-cache-v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return httpRes;
            });
        })
    );
});

```

#### install & fetch 区别

我们可以在 `install` 的时候进行静态资源缓存，也可以通过 `fetch` 事件处理回调来代理页面请求从而实现动态资源缓存。

两种方式可以比较一下：

- on install 的优点是第二次访问即可离线，缺点是需要将需要缓存的 URL 在编译时插入到脚本中，增加代码量和降低可维护性；

- on fetch 的优点是无需更改编译过程，也不会产生额外的流量，缺点是需要多一次访问才能离线可用。


#### Service Worker 版本更新


如果 `/sw.js` 内容有更新，当访问网站页面时浏览器获取了新的文件，逐字节比对 `/sw.js ` 文件发现不同时它会认为有更新启动 更新算法，于是会安装新的文件并触发 `install` 事件。但是此时已经处于激活状态的旧的 `Service Worker` 还在运行，新的 `Service Worker` 完成安装后会进入 `waiting` 状态。直到所有已打开的页面都关闭，旧的 `Service Worker` 自动停止，新的 `Service Worker` 才会在接下来重新打开的页面里生效。

#### 自动更新所有页面

```js
// 安装阶段跳过等待，直接进入 active
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
                        if (cacheName !== 'my-test-cache-v1') {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});
```

#### 手动更新 Service Worker

```js
var version = '1.0.1';

navigator.serviceWorker.register('/sw.js').then(function (reg) {
    if (localStorage.getItem('sw_version') !== version) {
        reg.update().then(function () {
            localStorage.setItem('sw_version', version)
        });
    }
});

```


#### Service Worker 生命周期

`Service Worker` 的使用过程很简单，所处理的事情也相对单一，我们基本上需要做的就是利用这个 `API` 做好站点的缓存策略


![](https://gss0.bdstatic.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/pwa/projects/1515680651546/sw-lifecycle.png)

#### 支持的事件

![](https://gss0.bdstatic.com/9rkZbzqaKgQUohGko9WTAnF6hhy/assets/pwa/projects/1515680651547/sw-events.png)



## workbox 是什么

Google Chrome 团队推出的一套 Web App 静态资源和请求结果的本地存储的解决方案

workbox 背后则是 Service Worker 和 Cache API 等技术

特点：

- 预缓存
- 运行时缓存
- 各种策略
- 请求路由
- 后台同步
- 方便调试
- 比sw-precache和sw-toolbox 更灵活性

#### 快速开始

使用前要注册

```
<script>
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
</script>
```

#### 路由和缓存策略模块

Workbox的主要功能之一是它的路由和缓存策略模块。它可以监听来自网页的请求，并确定是否以及如何缓存和响应该请求。
    
    - workbox.routing.registerRoute
        接受两个参数，第一个参数 capture 是正则表达式或 Express 风格的路由字符串，声明需要匹配那些请求，第二个参数用于告诉 Workbox 对前面拦截到的请求做何处理。
    - workbox.strategies.xxx
      用在 registerRoute 的第二个参数，表明使用何种缓   存策略

##### 缓存策略

- Stale While Revalidate  有更新重新验证  如果请求可用，此策略将使用缓存的响应，并在后台使用网络响应更新缓存
- Network First 网络优先 这将首先尝试从网络获取请求。如果收到响应，它会将其传递给浏览器并将其保存到缓存中。如果网络请求失败，将使用最后一个缓存的响应
- Cache First 缓存优先 此策略将首先检查缓存中的响应，如果有可用则使用该策略。如果请求不在缓存中，则将使用网络，并且在传递给浏览器之前，任何有效响应都将添加到缓存中
- Network Only 仅用网络 强制使用网络
- Cache Only  仅用 缓存 强制使用缓存

 

```js
workbox.routing.registerRoute(
  match,
  workbox.strategies.staleWhileRevalidate()
);

workbox.routing.registerRoute(
  match,
  workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
  match,
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  match,
  workbox.strategies.networkOnly()
);

workbox.routing.registerRoute(
  match,
  workbox.strategies.cacheOnly()
);

```



例子：

```
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js"
);

```

```
// JS 请求: 网络优先
workbox.routing.registerRoute(
  new RegExp('.*\.js'),
  workbox.strategies.networkFirst({
    cacheName: 'workbox:js',
  })
);
```

```
// CSS 请求: 缓存优先，同时后台更新后下次打开页面才会被页面使用
workbox.routing.registerRoute(
  // Cache CSS files
  /.*\.css/,
  // Use cache but update in the background ASAP
  workbox.strategies.staleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'workbox:css',
  })
);

// 图片请求: 缓存优先
workbox.routing.registerRoute(
  // Cache image files
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  // Use the cache if it's available
  workbox.strategies.cacheFirst({
    // Use a custom cache name
    cacheName: 'workbox:image',
    plugins: [
      new workbox.expiration.Plugin({
        // Cache only 20 images
        maxEntries: 20,
        // Cache for a maximum of a week
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);

```

离线应用
缓存成功后，即便断网，页面依旧可以访问及使用

```
// 主文档: 网络优先
workbox.routing.registerRoute(
  /index\.html/,
  workbox.strategies.networkFirst({
    cacheName: 'workbox:html',
  })
);
```

[更多常见配置请点](https://developers.google.com/web/tools/workbox/guides/common-recipes)

#### 跨域请求

在大多数的应用场景中，我们通常会将静态资源放到 CDN 中，这就涉及到跨域问题

`Workbox` 可以用 `networkFirst` 和 `staleWhileRevalidate` 两种策略 `Cache` 跨域资源，而 `cacheFirst` 则完全不行。

按 官网的解释，`Fetch` 跨域的请求是无法知道该请求是否成功，因此 `cacheFirst` 则有可能缓存下了失败的请求，并从此以后都会接管页面的这个请求导致页面错误。而 `networkFirst` 和 `staleWhileRevalidate` 是有更新机制的，即使一次错误下次也许就修复了

```js

workbox.routing.registerRoute(
  'https://cdn.google.com/example-script.min.js',
  workbox.strategies.networkFirst(),
);

// OR

workbox.routing.registerRoute(
  'https://cdn.google.com/example-script.min.js',
  workbox.strategies.staleWhileRevalidate(),
);

```


#### CLI 工具

上面的 routing 需要第三次访问才能真正从 Cache 中将缓存返回（或者支持离线），有没有办法将这个时间提前到第二次呢？这里，我们直接用 CLI 工具来解决这个问题

```bash
# 安装
npm install workbox-cli --global

# 生成配置文件 workbox-config.js
workbox wizard

# 生成 ServiceWorker JS 文件
workbox generateSW workbox-config.js 

```

[更多cli命令详见](https://developers.google.com/web/tools/workbox/modules/workbox-cli)


---

> 参考文档：
> [mdn](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API/Using_Service_Workers)
> 
> [workbox官方](https://developers.google.com/web/tools/workbox/guides/get-started)
> 
> [百度pwa](https://lavas.baidu.com/pwa/README)
> 
> [张鑫旭-借助Service Worker和cacheStorage缓存及离线开发](https://www.zhangxinxu.com/wordpress/2017/07/service-worker-cachestorage-offline-develop/)