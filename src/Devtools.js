var utils = require('./utils.js');

module.exports = function (signalStore, controller) {

  var isInitialized = false;

  var getDetail = function () {
    return {
      props: {
        signals: JSON.parse(JSON.stringify(signalStore.getSignals())),
        willKeepState: signalStore.willKeepState(),
        currentSignalIndex: signalStore.getCurrentIndex(),
        isExecutingAsync: signalStore.isExecutingAsync(),
        isRemembering: signalStore.isRemembering(),
        computedPaths: controller.getComputedPaths()
      }
    };
  };

  var update = utils.debounce(function () {
    var event = new CustomEvent('cerebral.dev.update', {
      detail: getDetail()
    });
    window.dispatchEvent(event);
  }, 100);

  var initialize = function () {

    if (isInitialized) {
      return;
    }

    isInitialized = true;

    // Might be an async signal running here
    if (signalStore.isExecutingAsync()) {
      controller.once('signalEnd', function () {
        var event = new CustomEvent('cerebral.dev.cerebralPong', {
          detail: getDetail()
        });
        signalStore.remember(signalStore.getSignals().length - 1);
        window.dispatchEvent(event);
      });
    } else {
      var event = new CustomEvent('cerebral.dev.cerebralPong', {
        detail: getDetail()
      });
      signalStore.rememberInitial(signalStore.getSignals().length - 1);
      window.dispatchEvent(event);
    }

  };

  window.addEventListener('cerebral.dev.debuggerPing', function () {
    if (utils.isDeveloping()) {
      initialize();
    }
  });

  window.addEventListener('cerebral.dev.requestUpdate', function () {
    update();
  });

  window.addEventListener('cerebral.dev.toggleKeepState', function () {
    signalStore.toggleKeepState();
    update();
  });

  window.addEventListener('cerebral.dev.resetStore', function () {
    signalStore.reset();
    controller.emit('change');
    update();
  });

  window.addEventListener('cerebral.dev.remember', function (event) {
    signalStore.remember(event.detail);
    update();
  });

  window.addEventListener('cerebral.dev.logComputedPath', function (event) {
    console.log('CEREBRAL - Computed path:', controller.getComputedValue(event.detail));
  });

  window.addEventListener('cerebral.dev.logPath', function (event) {
    var name = event.detail.name;
    var value = controller.get(event.detail.path);
    // toValue instead?
    console.log('CEREBRAL - ' + name + ':', value.toJS ? value.toJS() : value);
  });

  window.addEventListener('cerebral.dev.logModel', function (event) {
    console.log('CEREBRAL - model:', controller.get());
  });

  window.addEventListener('unload', function () {
    signalStore.removeRunningSignals();
    utils.hasLocalStorage() && localStorage.setItem('cerebral_signals', isInitialized && signalStore.willKeepState() ? JSON.stringify(signalStore.getSignals()) : JSON.stringify([]));
    utils.hasLocalStorage() && localStorage.setItem('cerebral_willKeepState', isInitialized && JSON.stringify(signalStore.willKeepState()));
  });

  return {
    update: update,
    start: function () {
      if (utils.isDeveloping()) {
        var event = new Event('cerebral.dev.cerebralPing');
        window.dispatchEvent(event);
      }
    }
  };

};
