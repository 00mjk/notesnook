let titleInput = document.getElementById('titleInput');
let infoBar = '.info-bar';
let info = null;
let scrollTimer = null;
function attachTitleInputListeners() {
  infoBar = '.info-bar';
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      autosize();
      document.body.onscroll = (event) => {
        if (scrollTimer) {
          clearTimeout(scrollTimer);
          scrollTimer = null;
        }
        scrollTimer = setTimeout(() => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              visible: event.target.documentElement.scrollTop.scrollTop,
              title: document.getElementById('titleInput').value,
              type: 'scroll',
            }),
          );
        }, 100);
      };
    },
    false,
  );

  document.getElementById('formBox').onsubmit = function (evt) {
    evt.preventDefault();
    if (tinymce.activeEditor) {
      tinymce.activeEditor && tinymce.activeEditor.focus();
    }
 
    onTitleChange();
  };

  document.getElementById('titleInput').onkeypress = function (evt) {
    if (evt.keyCode === 13 || evt.which === 13) {
      evt.preventDefault();
      if (tinymce.activeEditor) {
        tinymce.activeEditor && tinymce.activeEditor.focus();
      }
     

      onTitleChange();
      return false;
    }
  };

  document.getElementById('titleInput').addEventListener('focus', function (evt) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'focus',
          value: 'title',
        }),
      );
    }
  });


  document.getElementById('titleInput').onchange = function (evt) {
    autosize();
  };
  document.getElementById('titleInput').onkeyup = function (evt) {
    onTitleChange(evt);
  };
}

function onTitleChange(ele) {
  if (isLoading) {
    return;
  }
  let titleMessage = {
    type: 'title',
    value: titleInput.value,
  };

  info = document.querySelector(infoBar);
  if (tinymce.activeEditor) {
    info.querySelector('#infowords').innerText =
      tinymce.activeEditor.plugins.wordcount.getCount() + ' words';
  }

  autosize();
  if (titleMessage && typeof titleMessage.value === 'string') {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView?.postMessage(JSON.stringify(titleMessage));
    }
  }
}

function autosize() {
  let ele = document.getElementById('textCopy');
  ele.innerHTML = document.getElementById('titleInput').value.replace(/\n/g, '<br/>');
  let newHeight = document.getElementById('titlebar').scrollHeight;
  let css = document.createElement('style');
  css.type = 'text/css';
  let node = `
      .tox-tinymce {
        min-height:calc(100vh - ${newHeight}px) !important;
        };
   `;
  css.appendChild(document.createTextNode(node));
  document.getElementsByTagName('head')[0].appendChild(css);
}
