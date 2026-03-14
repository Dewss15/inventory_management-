const routes = {};

export function registerRoute(hash, renderFn, isPublic = false) {
  routes[hash] = { renderFn, isPublic };
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function start(getContainer, isLoggedIn, showAuthLayout, showAppLayout) {
  async function handleRoute() {
    const hash = window.location.hash || '#/login';
    const route = routes[hash];

    if (!route) {
      navigate(isLoggedIn() ? '#/dashboard' : '#/login');
      return;
    }

    if (!route.isPublic && !isLoggedIn()) {
      navigate('#/login');
      return;
    }

    if (route.isPublic && isLoggedIn() && (hash === '#/login' || hash === '#/signup')) {
      navigate('#/dashboard');
      return;
    }

    if (route.isPublic) {
      showAuthLayout();
    } else {
      showAppLayout(hash);
    }

    const container = getContainer(route.isPublic);
    await route.renderFn(container);
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
