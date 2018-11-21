if (navigator.serviceWorker) {  
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('恭喜。作用范围: ', registration.scope);
      })
      .catch(error => {
        console.log('抱歉', error);
      });
  }