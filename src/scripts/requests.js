function getHeaders(method) {
  /* eslint-disable-next-line */
  return { ...Requests.headers.defaults, ...Requests.headers[method] };
}

class Requests {
  static get(url) {
    return fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      headers: getHeaders('get'),
    });
  }

  static post(url, data) {
    return fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: getHeaders('post'),
      body: JSON.stringify(data),
    });
  }

  static put(url, data) {
    return fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: getHeaders('put'),
      body: JSON.stringify(data),
    });
  }

  static patch(url, data) {
    return fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      headers: getHeaders('patch'),
      body: JSON.stringify(data),
    });
  }

  static delete(url) {
    return fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      headers: getHeaders('delete'),
    });
  }
}

Requests.baseUrl = '';

Requests.headers = {
  defaults: {},
  get: {},
  post: {
    'Content-Type': 'application/json',
  },
  put: {
    'Content-Type': 'application/json',
  },
  patch: {
    'Content-Type': 'application/json',
  },
  delete: {},
};

export default Requests;
