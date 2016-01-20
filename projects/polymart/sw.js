this.addEventListener('install', function(event) {
  event.waitUntil(
    // TODO(sjmiles): flush the cache when a new worker is installed, 
    // mostly for easier testing
    caches.delete('v1').then(function() {
      caches.open('v1').then(function(cache) {
        // TODO(sjmiles): seed the cache with modules required for offline 
        // that may not be fetched by online app (due to bundling or laziness)
        return cache.addAll([
          'main.html',
          'imports.html',
          'mart/cache/payload.json',
          '../../components/polymer/polymer-nano.html', 
          '../../components/nano-elements/nano-layout.html',
          '../../components/nano-elements/nano-import.html',
          '../../components/nano-elements/nano-ripple.html',
          '../../components/nano-elements/nano-anchor.html',
          '../../components/nano-elements/nano-carousel.html',
          '../../components/nano-elements/nano-ajax.html',
          //'../../components/nano-elements/nano-spinner.html',
          '../../components/nano-elements/nano-serviceworker.html',
          '../../components/icons-simple.html',
          'src/polymart-view.html', 
          'src/home-view.html', 
          'src/simple-router.html', 
          'src/nav-bar.html', 
          'src/product-view.html', 
          'src/grid-layout.html',
          'src/search-view.html', 
          'src/categories-view.html', 
          'src/category-view.html', 
          'src/mart-data.html', 
          'src/product-detail.html' 
        ]);
      })
    })
  );
});

/*
false && this.addEventListener('online', function(event) {
  console.log('received online event');
  this.registration.showNotification('Online', {body: 'Online Achieved', tag: 'abe-says'});
});
*/

// serviceworker's hook into network operations
this.addEventListener('fetch', function(event) {
  // in certain unusual situations, we may want to no-op
  // and let the default machinery handle the request
  if (shouldFetch(event.request)) {
    event.respondWith(smartFetch(maybeRedirect(event.request)));
  }
});

var shouldFetch = function(request) {
  // if we require the browser to use it's default handling we can 
  // return 'false' and prevent ServiceWorker from handling the request
  return true;
}

var maybeRedirect = function(request) {
  var url = new URL(request.url);
  var module = url.pathname.split('/').pop();
  switch (module) {
    case '':
    case 'index.html':
      // user always sees `index.html`, but if SW is active 
      // it replaces `index.html` with app-shell
      request = new Request('main.html');
      break;
  }
  return request;
}

var smartFetch = function(request) {
  // begin a fetch no matter what, to freshen the cache
  // TODO(sjmiles): be aggressive, be be aggressive
  // TODO(sjmiles): does this need to be smarter to save bandwidth? 
  // I believe it's true that the browser cache is between this fetch
  // request and the actual network, so we can use standard cache
  // control as a partial throttle. 
  var fetchedResponse = cachedFetch(request);
  // return a cached response, or at least the fetch promise
  return caches.match(request).then(function(response) {
    return response || fetchedResponse;
  });
};

var cachedFetch = function(request) {
  return fetch(request).then(function(response) {
    maybeCache(request, response);
    return response;       
  }).catch(function(error) {
    throw error;
  });
};

var maybeCache = function(request, response) {
  // TODO(sjmiles): be aggressive, be be aggressive
  // TODO(sjmiles): should be smarter to save cache space
  cache(request, response);
  /*
  var url = new URL(request.url);
  var module = url.pathname.split('/').pop();
  switch (module) {
    case 'imports.html':
    case 'index.css.html':
    case 'index.main.html':
    case 'service-worker.html':
    case 'nav-bar.html':
    case 'some-content.html':
      cache(request, response);
      break;
  }
  */
};

var cache = function(request, response) {
  // TODO(sjmiles): we don't require cloning if we are 
  // just freshening the cache, how expensive is it?
  var cacheable = response.clone();
  caches.open('v1').then(function(cache) {
    return cache.put(request, cacheable);
  });
};