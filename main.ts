
/** functions */
function autoSelectLanguageCode():string {
  let tempLanguageCode:string = browser.i18n.getUILanguage();

  /** fix for German */
  if ( tempLanguageCode.indexOf( 'de' ) != -1 ) {
    tempLanguageCode = 'de';
    return tempLanguageCode;
  }
  /** fix for English */
  if ( tempLanguageCode.indexOf( 'en' ) != -1 ) {
    tempLanguageCode = 'en';
    return tempLanguageCode;
  }
  /** fix for Spnish */ 
  if ( tempLanguageCode.indexOf( 'es' ) != -1 ) {
    tempLanguageCode = 'es';
    return tempLanguageCode;
  }
  /** fix for Portuguese */
  if ( tempLanguageCode.indexOf( 'pt' ) != -1 ) {
    tempLanguageCode = 'pt';
    return tempLanguageCode;
  }
  return tempLanguageCode;
}

function buildUrlTranslateText( obj:settings ):settings {
  switch ( obj.translationService ) {
    case 'Microsoft':
      obj.url = 'https://www.bing.com/translator?from=&to='+obj.languageCode+'&text='+obj.targetString;
      break;
    case 'Google':
      obj.url = 'https://translate.google.com/?sl=auto&tl='+obj.languageCode+'&text='+obj.targetString+'&op=translate';
      break;
  }
  return obj;
}

function buildUrlTranslateWebpage( obj:settings ):settings {
  switch ( obj.translationService ) {
    case 'Microsoft':
      obj.url = 'https://www.translatetheweb.com/?from=&to='+obj.languageCode+'&a='+obj.targetString;
      break;
    case 'Google':
      obj.url = 'https://translate.google.com/translate?hl='+obj.languageCode+'&sl=auto&tl='+obj.languageCode+'&u='+obj.targetString;
      break;
  }
  return obj;
}

function openTranslationResult( obj:settings ) {
  switch ( obj.openMethod ) {
    case 'tab':
      browser.tabs.create({ url: obj.url });
      break;
    case 'window':
      if ( obj.specifySizeFlag == true ) {
        browser.windows.create({ url: obj.url, height: obj.sizeHeight, width: obj.sizeWidth });
      } else {
        browser.windows.create({ url: obj.url });
      }
      break;
  }
}

/** functions: optimize~ */
function optimiseLanguageCode( languageCode:string ):string {
  switch ( languageCode ) {
    case 'auto':
    case undefined:
      languageCode = autoSelectLanguageCode();
      break;
  }
  return languageCode;
}

function optimizeOpenMethod( openMethod:string ):string {
  switch ( openMethod ) {
    case undefined:
      openMethod = 'tab';
      break;
  }
  return openMethod;
}

function optimizeTargetText( targetText:string ):string {
  targetText
    .replace( /\%/g, '％' )
    .replace( /\"/g, '%22' )
    .replace( /\&/g, '%26' )
    .replace( /\'/g, '%27' )
    .replace( /\</g, '%3C' )
    .replace( /\>/g, '%3E' );
  return targetText;
}

function optimizeTargetUrl( targetUrl:string ):string {
  targetUrl
    .replace( /\"/g, '%22' )
    .replace( /\</g, '%3C' )
    .replace( /\>/g, '%3E' );
  return targetUrl;
}

function optimizeTranslationService( translationService:string ):string {
  switch ( translationService ) {
    case undefined:
      translationService = 'Google';
      break;
  }
  return translationService;
}

/**
 * functions         : processTranslate~
 * keys of "settings": languageCode, openMethodText / openMethodWebpage, 
 *                     sizeHeight, sizeWidth, specifySize, targetString, translationService
 */
function processTranslateText( targetText:string ) {
  browser.storage.local.get( null )
    .then( ( obj:settings ) => {
      obj.languageCode       = optimiseLanguageCode( obj.languageCode );
      obj.openMethod         = optimizeOpenMethod( obj.openMethodText );
      obj.targetString       = optimizeTargetText( targetText );
      obj.translationService = optimizeTranslationService( obj.translationService );
      delete obj.openMethodText;
      return obj;
    })
    .then( ( obj:settings ) => { return buildUrlTranslateText( obj ); })
    .then( ( obj:settings ) => { return openTranslationResult( obj ); })
    .catch( ( id:exception ) => {
      console.log( id.name + ': ' + id.message );
    });
}

function processTranslateWebpage( targetUrl:string ) {
  browser.storage.local.get( null )
    .then( ( obj:settings ) => {
      obj.languageCode       = optimiseLanguageCode( obj.languageCode );
      obj.openMethod         = optimizeOpenMethod( obj.openMethodWebpage );
      obj.targetString       = optimizeTargetUrl( targetUrl );
      obj.translationService = optimizeTranslationService( obj.translationService );
      delete obj.openMethodWebpage;
      return obj;
    })
    .then( ( obj:settings ) => { return buildUrlTranslateWebpage( obj ); })
    .then( ( obj:settings ) => { return openTranslationResult( obj ); })
    .catch( ( id:exception ) => {
      console.log( id.name + ': ' + id.message );
    });
}

/** setup */
function initialProcess() {
  const id1:string = 'idTranslateText';
  const id2:string = 'idTranslateWebpage';

  browser.menus.create({
    contexts: ['selection'],
    id:       id1,
    title:    browser.i18n.getMessage( 'contextMenuForTextTranslation' )
  });

  browser.menus.create({
    contexts: ['page'],
    id:       id2,
    title:    browser.i18n.getMessage( 'contextMenuForWebpageTranslation' )
  });
  
  browser.menus.onClicked.addListener( ( info ) => {
    switch ( info.menuItemId ) {
      case id1:
        processTranslateText( info.selectionText );
        break;
      case id2:
        processTranslateWebpage( info.pageUrl );
        break;
    }
  });
}

initialProcess();
