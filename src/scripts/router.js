function browse(url, callback) {
  window.history.pushState({}, '', url);
  callback(url);
}

/**
 * Simple route handling
 * @param {(routeAction) => void} onRouteMatch Receives the route associated value on match
 * @param {Object<string,any>} routes Object consisting of route => value pairs
 */
function CreateHashRouter(onRouteMatch, routes) {
  function RouteManager() {
    let { hash } = window.location;

    // if hash is empty we're at root
    if (hash === '') hash = '#/';

    for (const route in routes) {
      if (`#${route}` === hash) return onRouteMatch({ action: routes[route], route });
    }
  }

  function handleClientSideRedirect(event) {
    event.preventDefault();
    browse(this.href, RouteManager);
  }

  // on initialization check if we're on a matching route
  RouteManager();
  // attach to history change events
  window.addEventListener('popstate', RouteManager);
  return handleClientSideRedirect;
}

export default CreateHashRouter;
