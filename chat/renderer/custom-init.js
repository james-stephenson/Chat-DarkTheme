const {remote} = require('electron')


const directMessagesHTML = '<content role="listitem" data-group-id="space/AAAAP1rGZzg" style="order: 1;"><div role="heading" aria-level="2" class="k7aBq"><div class="aOHsTc wJNchb" jsname="dms">Direct Messages</div></div></content>';

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

  watchMainPane();
});

function watchMainPane() {
  var box = document.querySelector("div#yDmH0d");
  var config = { childList: true };

  var mainPane = box.querySelector(":scope > c-wiz:not(.oCHqfe)");
  var roomObserver = initializeSortedRoomList(mainPane);

  var callback = function(mutationsList, observer) {
    mutationsList.forEach((mutation) => {
      switch(mutation.type) {
        case 'childList':
          var mainPane = mutation.target.querySelector(":scope > c-wiz:not(.oCHqfe)");
          if (mainPane != null) {
            if (roomObserver != null) {
              roomObserver.disconnect();
              roomObserver = null;
            }

            roomObserver = initializeSortedRoomList(mainPane);
          }

          break;
      }
    });
  }

  var observer = new MutationObserver(callback);
  observer.observe(box, config);

  return observer;
}

function initializeSortedRoomList(mainPane) {
  var recentRooms = mainPane.querySelector("div.vHL80e > div[role='list']");

  var directMessagesTemplate = document.createElement('template');
  directMessagesTemplate.innerHTML = directMessagesHTML;
  recentRooms.appendChild(directMessagesTemplate.content.firstChild);

  var config = { childList: true, subtree: true }

  organizeRooms(recentRooms);
  var callback = function(mutationsList, observer) {
    mutationsList.forEach((mutation) => {
      switch(mutation.type) {
        case 'childList':
          organizeRooms(recentRooms);
          break;
      }
    });
  }

  var observer = new MutationObserver(callback);
  observer.observe(recentRooms, config);

  return observer;
}

function partition(array, isValid) {
  return array.reduce(([pass, fail], elem) => {
    return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
  }, [[], []]);
}

function organizeRooms(parentNode) {
  var items = Array.from(parentNode.querySelectorAll("content.dHI9xe"));
  var [roomItems, dmItems] = partition(items, (room) => room.querySelector(".t5F5nf > .w3vN9b") == null);

  roomItems.forEach (e => { e.style.order = 0; });
  dmItems.forEach (e => { e.style.order = 2; });
}

