function setupDialogs(defaultTip) {
  var dlgOpts = {
    autoOpen: false,
    title: 'tipjar broker'
  };
  $('#dialog').dialog(dlgOpts);
}

function closeDlg() {
  $('#dialog').dialog('close');
}

function displayYesNo(msg, yesCallback) {
  $('#dialog .dlgmsg').html(msg);
  $('#dialog .dlgctls').html('<button class="dlgyes">yes</button> <button class="dlgno">no</button>');
  $('#dialog .dlgctls .dlgno').click(function() {
    closeDlg();
  });
  $('#dialog .dlgctls .dlgyes').click(function() {
    closeDlg();
    yesCallback();
  });
  $('#dialog').dialog('open');
}

function displayMsg(msg, closable) {
  if (closable === undefined) {
    closable = true;
  }
  $('#dialog .dlgmsg').html(msg);
  if (closable) {
    $('#dialog .dlgctls').html('<button class="dlgcls">ok</button>');
    $('#dialog .dlgctls .dlgcls').click(function() {
      closeDlg();
    });
  }
  $('#dialog').dialog('open');
}

function displayError(errmsg) {
  displayMsg('Error: ' + errmsg);
}
