// UnityLoader.js
(function () {
  window.UnityLoader = {
    instantiate: function (containerId, buildUrl) {
      // Unity instantiation logic here
      console.log(
        `Instantiating Unity in container: ${containerId} with build: ${buildUrl}`
      );
      // Example instantiation logic
      const unityInstance = UnityLoader.instantiate(containerId, buildUrl);
      return unityInstance;
    },
  };
})();
