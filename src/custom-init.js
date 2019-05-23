const {remote} = require('electron')

document.addEventListener("keydown", function(e) {
  if (e.which === 123) {
    remote.getCurrentWindow().openDevTools();
  }
});

document.addEventListener("DOMContentLoaded", function() {
  let webviews = document.querySelectorAll("webview");

  // Fetch our CSS in parallel ahead of time
  const tree = 'custom-css';
  const cssPath = 'https://raw.githubusercontent.com/james-stephenson/Chat-DarkTheme/' + tree + '/styles/slackish.css';
  let cssPromise = fetch(cssPath).then(response => response.text());

  // Insert a style tag into the wrapper view
  cssPromise.then(css => {
    let s = document.createElement('style');
    s.type = 'text/css';
    s.innerHTML = css;
    document.head.appendChild(s);
  });

  // Wait for each webview to load
  webviews.forEach(webview => {
    webview.addEventListener('ipc-message', message => {
      if (message.channel == 'didFinishLoading')
        // Finally add the CSS into the webview
        cssPromise.then(css => {
          let script = `
              let s = document.createElement('style');
              s.type = 'text/css';
              s.id = 'chat-custom-css';
              s.innerHTML = \`${css}\`;
              document.head.appendChild(s);
              `
          webview.executeJavaScript(script);
        })
    });
  });

});
