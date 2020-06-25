export function matches(route) {
  const { hash } = window.location;
  if (route === '/' && hash === '') return true;
  return `#${route}` === hash;
}

/**
 * Simple route handling
 * @param {(routeAction) => void} onRouteMatch Receives the route associated value on match
 * @param {Object<string,any>} routes Object consisting of route => value pairs
 */
function CreateHashRouter(onRouteMatch, routes) {
  function browse(url, callback) {
    window.history.pushState({}, '', url);
    callback(url);
  }

  function RouteManager() {
    for (const route in routes) {
      if (matches(route)) return onRouteMatch({ action: routes[route], route });
    }
  }
  class Router {
    static handleLinkRedirect(event) {
      event.preventDefault();
      browse(this.href, RouteManager);
    }

    static navigate(url) {
      browse(url, RouteManager);
    }
  }

  // on initialization check if we're on a matching route
  RouteManager();
  // attach to history change events
  window.addEventListener('popstate', RouteManager);
  return Router;
}

export default CreateHashRouter;
