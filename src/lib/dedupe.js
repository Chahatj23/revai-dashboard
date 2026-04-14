/**
 * applyDedupe - Adds request deduplication to an Axios instance.
 * @param {import('axios').AxiosInstance} instance - The axios instance to enhance.
 */
export function applyDedupe(instance) {
  const pendingRequests = new Map();

  const getRequestKey = (config) => {
    const { method, url, params, data } = config;
    // Normalize data and params to ensure matching
    const serializedParams = params ? JSON.stringify(params) : '';
    const serializedData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : '';
    return [method, url, serializedParams, serializedData].join('|');
  };

  instance.interceptors.request.use((config) => {
    const key = getRequestKey(config);
    if (pendingRequests.has(key)) {
      const promise = pendingRequests.get(key);
      // Return the already-in-flight promise
      config.adapter = () => promise;
    }
    return config;
  }, (error) => Promise.reject(error));

  instance.interceptors.response.use((response) => {
    const key = getRequestKey(response.config);
    pendingRequests.delete(key);
    return response;
  }, (error) => {
    if (error.config) {
      const key = getRequestKey(error.config);
      pendingRequests.delete(key);
    }
    return Promise.reject(error);
  });

  // Wrap the request method to capture and store the promise
  const originalRequest = instance.request.bind(instance);
  instance.request = (config) => {
    const key = getRequestKey(config);
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    const promise = originalRequest(config);
    pendingRequests.set(key, promise);
    return promise;
  };
}
