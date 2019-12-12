// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', event => {
  if (event.request.url.indexOf(':8885/images/') > -1) {
    // console.log('in fetch listener', event.request.url);
    event.respondWith(
      caches.match(event.request).then(response => {
        // caches.match() always resolves
        // but in case of success response will have value
        if (response !== undefined) {
          // console.log('found in cache!');
          return response;
        }
        return fetch(event.request)
          .then(resp => {
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            const responseClone = resp.clone();
            // console.log('caching');
            caches
              .open('assets')
              .then(cache => cache.put(event.request, responseClone))
              .catch(() => console.error('unable to open cache'));
            return resp;
          })
          .catch(() => {
            console.error('fetch error!');
            return '';
            // return caches.match('/sw-test/gallery/myLittleVader.jpg');
          });
      })
    );
  }
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
  event.waitUntil(caches.open('assets').then(cache => cache.addAll([])));
});
