import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const suppressScript = `
  (function(){
    try{
      var block = function(e){
        try{
          var msg = '' + (e && (e.message || (e.reason && (e.reason.message || e.reason))) || '');
          if (msg.indexOf('Cannot redefine property: ethereum') !== -1) {
            if (e && e.preventDefault) e.preventDefault();
            return true;
          }
        }catch(_){}
        return false;
      };
      window.addEventListener('error', block, true);
      window.addEventListener('unhandledrejection', block, true);
      var origErr = console.error;
      console.error = function(){
        try{
          var first = arguments[0];
          var text = (typeof first === 'string') ? first : (first && first.message) || '';
          if (text && text.indexOf('Cannot redefine property: ethereum') !== -1) return;
        }catch(_){}
        return origErr.apply(console, arguments);
      };
    }catch(_){}
  })();
  `

  return (
    <Html lang="es">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: suppressScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}




