
// ID
const ID01    = 'selectText';
const title01 = browser.i18n.getMessage('menuTextTitle01');

const ID02    = 'clickPage';
const title02 = browser.i18n.getMessage('menuTextTitle02');

// menu
const menu01 = browser.menus.create({
  id: ID01, title: title01, contexts: ['selection']
});

const menu02 = browser.menus.create({
  id: ID02, title: title02, contexts: ['page']
});

// behavior
function openByNewWindow(URL, specifySize, sizeWidth, sizeHeight) {
  if (specifySize) {
    browser.windows.create({ url: URL, width: sizeWidth, height: sizeHeight });
  } else {
    browser.windows.create({ url: URL });
  }
}

function openByNewTab(URL) {
  browser.tabs.create({ url: URL });
}

function notificationNotSet() {
  browser.notifications.create('notificationNS', {
    'type'   : 'basic',
    'title'  : 'Notification: addon \"Quick translate\"',
    'message': browser.i18n.getMessage('notificationTextNotSet')
  });
  setTimeout(function(){ browser.notifications.clear('notificationNS'); }, 6000);
}

// Behavior clicked menu button
browser.menus.onClicked.addListener((info) => {
  function menuBehavior(obj) {
    switch (info.menuItemId) {
      // For transrate a text
      case ID01:
        if ( (obj.openMethod_text == null) || (obj.languageCode == null) ) {
          notificationNotSet();
        }
        const targetText = info.selectionText
          .replace(/\%/g, '％')
          .replace(/\&/g, '%26')
          .replace(/\//g, '%2F')
          .replace(/\|/g, '%7C');
        const URL_translateText = 'https://translate.google.com/#view=home&op=translate&sl=auto&tl='+obj.languageCode+'&text='+targetText;
        switch (obj.openMethod_text) {
          case 'window':
            openByNewWindow(URL_translateText, obj.specifySize, obj.sizeWidth, obj.sizeHeight);
            break;
          case 'tab':
            openByNewTab(URL_translateText);
            break;
        }
        break;
      // For transrate a web site
      case ID02:
        if ( (obj.openMethod_website == null) || (obj.languageCode == null) ) {
          notificationNotSet();
        }
        const URL_translateWebsite = 'https://translate.google.com/translate?&sl=auto&tl='+obj.languageCode+'&u='+info.pageUrl;
        switch (obj.openMethod_website) {
          case 'window':
            openByNewWindow(URL_translateWebsite, obj.specifySize, obj.sizeWidth, obj.sizeHeight);
            break;
          case 'tab':
            openByNewTab(URL_translateWebsite);
            break;
        }
        break;
    }
  }
  // Get setting
  browser.storage.local.get(['openMethod_text', 'openMethod_website', 'specifySize', 'sizeWidth', 'sizeHeight', 'languageCode'])
    .then(menuBehavior);
});

// Add an action button to toolbar
browser.pageAction.onClicked.addListener((tab) => {
  function addressbarBehavior(obj) {
    if ( (obj.openMethod_website == null) || (obj.languageCode == null) ) {
      notificationNotSet();
    }
    const barURL = 'https://translate.google.com/translate?hl='+obj.languageCode+'&sl=auto&tl='
                 +obj.languageCode+'&u='+tab.url;
    switch (obj.openMethod_website) {
      case 'window':
        openByNewWindow(barURL, obj.specifySize, obj.sizeWidth, obj.sizeHeight);
        break;
      case 'tab':
        openByNewTab(barURL);
        break;
    }
  }
  // Get setting
  browser.storage.local.get(['openMethod_website', 'specifySize', 'sizeWidth', 'sizeHeight', 'languageCode'])
    .then(addressbarBehavior);
});
