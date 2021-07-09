import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {eSendEvent} from '../../../../services/EventManager';
import {editing} from '../../../../utils';
import {
  eCloseProgressDialog,
  eOpenProgressDialog,
} from '../../../../utils/Events';
import {sleep} from '../../../../utils/TimeUtils';
import {EditorWebView} from '../../Functions';
import tiny from '../tiny';
import {formatSelection} from './constants';

export const execCommands = {
  bold: `tinymce.activeEditor.execCommand('Bold');`,
  alignleft: `tinymce.activeEditor.execCommand('JustifyLeft');`,
  alignright: `tinymce.activeEditor.execCommand('JustifyRight');`,
  aligncenter: `tinymce.activeEditor.execCommand('JustifyCenter');`,
  alignjustify: `tinymce.activeEditor.execCommand('JustifyFull');`,
  italic: `tinymce.activeEditor.execCommand('Italic');`,
  strikethrough: `tinymce.activeEditor.execCommand('Strikethrough');`,
  underline: `tinymce.activeEditor.execCommand('Underline');`,
  superscript: `tinymce.activeEditor.execCommand('Superscript');`,
  subscript: `tinymce.activeEditor.execCommand('Subscript');`,
  forecolor: color =>
    `tinymce.activeEditor.execCommand('ForeColor',false, '${color}');`,
  hilitecolor: color =>
    `tinymce.activeEditor.execCommand('HiliteColor',false, '${color}');`,

  fontname: fontname =>
    `tinymce.activeEditor.execCommand('FontName',false, '${fontname}');`,

  indent: `tinymce.activeEditor.execCommand('Indent');`,
  outdent: `tinymce.activeEditor.execCommand('Outdent');`,
  blockquote: `tinymce.activeEditor.execCommand('mceBlockQuote');`,
  link: link =>
    `tinymce.activeEditor.execCommand('mceInsertLink',false, '${link}');`,
  unlink: `tinymce.activeEditor.execCommand('Unlink')`,
  fontsize: size =>
    `tinymce.activeEditor.execCommand('FontSize', false, '${size}');`,
  removeformat: `tinymce.activeEditor.execCommand('RemoveFormat');`,
  p: `tinymce.activeEditor.execCommand('FormatBlock', false, 'p');`,
  h2: `tinymce.activeEditor.execCommand('FormatBlock', false, 'h2');`,
  h3: `tinymce.activeEditor.execCommand('FormatBlock', false, 'h3');`,
  h4: `tinymce.activeEditor.execCommand('FormatBlock', false, 'h4');`,
  h5: `tinymce.activeEditor.execCommand('FormatBlock', false, 'h5');`,
  h6: `tinymce.activeEditor.execCommand('FormatBlock', false, 'h6');`,
  pre: `tinymce.activeEditor.execCommand('FormatBlock', false, 'pre');`,
  ol: style =>
    `tinymce.activeEditor.execCommand('InsertOrderedList', false, {'list-style-type': "${style}"});`,
  ul: style =>
    `tinymce.activeEditor.execCommand('InsertUnorderedList', false, {'list-style-type': "${style}"});`,
  removeList: `tinymce.activeEditor.execCommand('RemoveList');`,
  horizontal: `tinymce.activeEditor.execCommand('InsertHorizontalRule');`,
  rtl: `tinymce.activeEditor.execCommand('mceDirectionRTL');`,
  ltr: `tinymce.activeEditor.execCommand('mceDirectionLTR');`,
  magnify: `
  tinymce.activeEditor.execCommand('SearchReplace');
  setTimeout(function() {
    document.querySelector(".tox-textfield").focus()
  },100)
  `,
  table: (r, c) =>
    `(function() {
      let body = tinymce.activeEditor.contentDocument.getElementsByTagName("body")[0];
      if (body.lastElementChild && body.lastElementChild.innerHTML === tinymce.activeEditor.selection.getNode().innerHTML) {
        let rng = tinymce.activeEditor.selection.getRng()
        tinymce.activeEditor.execCommand("mceInsertNewLine")
        tinymce.activeEditor.nodeChanged({selectionChange:true})
        tinymce.activeEditor.selection.setRng(rng)
     }  
     editor.undoManager.transact(function() {
      tinymce.activeEditor.execCommand('mceInsertTable', false, { rows: ${r}, columns: ${c} }); 
     }); 
     
    })();`,

  cl: `tinymce.activeEditor.execCommand('InsertCheckList')`,
  image: async () => {
    if (editing.isFocused) {
      tiny.call(EditorWebView, tiny.blur);
      await sleep(300);
      editing.isFocused = true;
    }
    eSendEvent(eOpenProgressDialog, {
      noProgress: true,
      noIcon: true,
      actionsArray: [
        {
          action: async () => {
            eSendEvent(eCloseProgressDialog);
            await sleep(300);
            launchCamera(
              {
                includeBase64: true,
                maxWidth: 1024,
                mediaType: 'photo',
              },
              handleImageResponse,
            );
          },
          actionText: 'Take photo',
          icon: 'camera',
        },
        {
          action: async () => {
            eSendEvent(eCloseProgressDialog);
            await sleep(300);
            launchImageLibrary(
              {
                includeBase64: true,
                maxWidth: 1024,
                mediaType: 'photo',
              },
              handleImageResponse,
            );
          },
          actionText: 'Select from gallery',
          icon: 'image-multiple',
        },
      ],
    });

    return;
  },
  video: `tinymce.activeEditor.execCommand('mceMedia')`,
  pre: `
    tinymce.activeEditor.execCommand('CodeBlock')
  `,
  tableprops: "tinymce.activeEditor.execCommand('mceTableProps');",
  tabledelete: "tinymce.activeEditor.execCommand('mceTableDelete');",
  tablesplitcell: "tinymce.activeEditor.execCommand('mceTableSplitCells');",
  tablemergecell: "tinymce.activeEditor.execCommand('mceTableMergeCells');",
  tablerowprops: "tinymce.activeEditor.execCommand('mceTableRowProps');",
  imageResize25: `(function() {
    let node = tinymce.activeEditor.selection.getNode();
  if (tinymce.activeEditor.selection.getNode().tagName === 'IMG') {

    tinymce.activeEditor.undoManager.transact(function() {
      if (tinymce.activeEditor.dom.hasClass(node,"img_size_one")) {
        tinymce.activeEditor.dom.removeClass(node,"img_size_one")
      }
      if (tinymce.activeEditor.dom.hasClass(node,"img_size_two")) {
        tinymce.activeEditor.dom.removeClass(node,"img_size_two")
      }
      tinymce.activeEditor.dom.addClass(node,"img_size_three")
      setTimeout(function() {
        tinymce.activeEditor.nodeChanged({selectionChange:true})
      },100)
    });
 
  }

  })();
  
  `,
  imageResize50: `(function() {
    let node = tinymce.activeEditor.selection.getNode();
  if (tinymce.activeEditor.selection.getNode().tagName === 'IMG') {
      tinymce.activeEditor.undoManager.transact(function() {
      if (tinymce.activeEditor.dom.hasClass(node,"img_size_one")) {
        tinymce.activeEditor.dom.removeClass(node,"img_size_one")
      }
      if (tinymce.activeEditor.dom.hasClass(node,"img_size_three")) {
        tinymce.activeEditor.dom.removeClass(node,"img_size_three")
      }
      tinymce.activeEditor.dom.addClass(node,"img_size_two")
      setTimeout(function() {
        tinymce.activeEditor.nodeChanged({selectionChange:true})
      },100)
    
    });
   
  }
  })()
  
  `,
  imageResize100: `(function() {
    let node = tinymce.activeEditor.selection.getNode();
  if (tinymce.activeEditor.selection.getNode().tagName === 'IMG') {
    tinymce.activeEditor.undoManager.transact(function() {
      if (tinymce.activeEditor.dom.hasClass(node,"img_size_three")) {
        tinymce.activeEditor.dom.removeClass(node,"img_size_three")
      }
      if (tinymce.activeEditor.dom.hasClass(node,"img_size_two")) {
        tinymce.activeEditor.dom.removeClass(node,"img_size_two")
      }
      tinymce.activeEditor.dom.addClass(node,"img_size_one")
      setTimeout(function() {
        tinymce.activeEditor.nodeChanged({selectionChange:true})
      },100)
     
    });
  }
  })()
  
  `,
  imagepreview: `(function() {
    if (tinymce.activeEditor.selection.getNode().tagName === 'IMG') {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
  
      xhr.onload = function () {
        var recoveredBlob = xhr.response;
        var reader = new FileReader();
        reader.onload = function () {
          var blobAsDataUrl = reader.result;
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'imagepreview',
              value: blobAsDataUrl
            })
          );
          reader.abort();
          xhr.abort();
        };
        reader.readAsDataURL(recoveredBlob);
      };
      xhr.open(
        'GET',
        tinymce.activeEditor.selection.getNode().getAttribute('src')
      );
      xhr.send();
    }
  })();
  `,
  removeimage: `
  (function() {
    if (tinymce.activeEditor.selection.getNode().tagName === 'IMG') {
    tinymce.activeEditor.undoManager.transact(function() {tinymce.activeEditor.execCommand('Delete');});
    setTimeout(function() {
      tinymce.activeEditor.nodeChanged({selectionChange:true})
    },100)
    }  
  })();
  `,
  imagefloatleft: `(function () {
let node = tinymce.activeEditor.selection.getNode();
  if (node.tagName === 'IMG') {
   
    tinymce.activeEditor.undoManager.transact(function() {
      if (tinymce.activeEditor.dom.hasClass(node,"img_float_right")) {
        tinymce.activeEditor.dom.removeClass(node,"img_float_right")
      }
      if (tinymce.activeEditor.dom.hasClass(node,"img_float_none")) {
        tinymce.activeEditor.dom.removeClass(node,"img_float_none")
      }
      tinymce.activeEditor.dom.addClass(node,"img_float_left")
      setTimeout(function() {
        tinymce.activeEditor.nodeChanged({selectionChange:true})
      },100)
    });
  }
  })();
  
  `,
  imagefloatright: `(function () {
let node = tinymce.activeEditor.selection.getNode();
  if (node.tagName === 'IMG') {
   
    tinymce.activeEditor.undoManager.transact(function() {
      if (tinymce.activeEditor.dom.hasClass(node,"img_float_left")) {
        tinymce.activeEditor.dom.removeClass(node, "img_float_left")
      }
      if (tinymce.activeEditor.dom.hasClass(node,"img_float_none")) {
        tinymce.activeEditor.dom.removeClass(node,"img_float_none")
      }
      tinymce.activeEditor.dom.addClass(node,"img_float_right")
      setTimeout(function() {
        tinymce.activeEditor.nodeChanged({selectionChange:true})
      },100)
     
    });
  }
  })()
  
  `,
  imagefloatnone: `(function () {
  let node = tinymce.activeEditor.selection.getNode();
  if (node.tagName === 'IMG') {
   
    tinymce.activeEditor.undoManager.transact(function() {
      if (tinymce.activeEditor.dom.hasClass(node,"img_float_left")) {
        tinymce.activeEditor.dom.removeClass(node,"img_float_left")
      }
      if (tinymce.activeEditor.dom.hasClass(node,"img_float_right")) {
        tinymce.activeEditor.dom.removeClass(node,"img_float_right")
      }
      tinymce.activeEditor.dom.addClass(node,"img_float_none")
      setTimeout(function() {
        tinymce.activeEditor.nodeChanged({selectionChange:true})
      },100)
    });
  }
  })()
  
  `,
  'line-break': `
  tinymce.activeEditor.undoManager.transact(function() {
    tinymce.activeEditor.execCommand('InsertLineBreak');
  });`,
};

const handleImageResponse = response => {
  if (response.didCancel || response.errorMessage) {
    return;
  }

  let b64 = `data:${response.type};base64, ` + response.base64;
  formatSelection(`
  (function() {
    let pTag = "";
    let body = tinymce.activeEditor.contentDocument.getElementsByTagName("body")[0];
    if (body.lastElementChild && body.lastElementChild.innerHTML === tinymce.activeEditor.selection.getNode().innerHTML) {
      pTag = "<p></p>"
    }
    
  minifyImg(
  "${b64}",
  1024,
  'image/jpeg',
  function(r) {
    var content = "<img style=" + "max-width:100% !important;" + "src=" + r + ">" + pTag;
    editor.undoManager.transact(function() {editor.execCommand("mceInsertContent",false,content)}); 
  },
  0.6
  );
  
  })();
`);
};
