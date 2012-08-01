/* TipJar client script. To be included in sites wishing to receive tips. */

var mintChipFactory;
var messageFactory;
var mintChip;

var tipDlg, tipSuccessDlg, tipErrorDlg;
var tipJarSelector, tipJarPayeeId, tipJarDefaultTip;
var brokerUrl = 'http://mrcote.info/broker/api/v1/valuemessage/';

function createValueMessage(amount, annotation) {
  var valueMessage;
  try {
    if (!mintChip.isValidId(tipJarPayeeId)) {
      tipJarDisplayError('This site has been configured with an invalid MintChip ID. :(');
      return null;
    }

    if (amount.length == 0 || isNaN(amount)) {
      tipJarDisplayError('Invalid amount.');
      return null;
    }

    var request = messageFactory.createValueRequestMessage(tipJarPayeeId, amount, mintChipApi().currencyCode.CAD);
    request.challenge = Math.round(Math.random() * (Math.pow(2, 31)-1));
    request.annotation = annotation;
    request.responseAddress = "www.mint.ca";

    var str = request.toBase64String(); // to test serialization
    var receivedRequest = messageFactory.toMessage(str);

    valueMessage = mintChip.createValueMessage(receivedRequest);
  } catch (err) {
    tipJarDisplayError(err);
  }
  return valueMessage;
}

function setupDialogs() {
  var dlgOpts = {
    autoOpen: false,
    title: 'TipJar'
  };

  tipDlg = $('<div></div>')
            .html('<form id="tipjarform"><div>Leave $<input id="tipjaramt" type="number" value="' + tipJarDefaultTip + '" style="width: 3em"/> tip?</div><div><label for="tipjarcmt">Comment (optional):</label><textarea id="tipjarcmt" type="text" rows="5" style="width: 10em" /></div><div><input type="submit" value="ok" /></div></form></div>')
            .dialog(dlgOpts);
  tipSuccessDlg = $('<div></div>')
                   .html('<div>Your tip has been sent!</div><div><button class="tipjarclose">ok</button></div>')
                   .dialog(dlgOpts);
  tipErrorDlg = $('<div></div>')
                   .html('<div class="errormsg"></div><div><button class="tipjarclose">ok</button></div>')
                   .dialog(dlgOpts);
  $(tipSuccessDlg.find('.tipjarclose')).click(function() {
    tipSuccessDlg.dialog('close');
  });
  $(tipErrorDlg.find('.tipjarclose')).click(function() {
    tipErrorDlg.dialog('close');
  });
}

function sendTip(valueMsg, amount, comment) {
  var jsonMsg = {
    'dest_mintchip_id': tipJarPayeeId,
    'value_msg': valueMsg,
    'amount': amount,
    'comment': comment
  };
  $.ajax({
    url: brokerUrl,
    type: 'POST',
    contentType: 'application/json',
    accepts: 'application/json',
    data: JSON.stringify(jsonMsg),
    dataType: 'json',
    success: function() {
      tipDlg.dialog('close');
      tipSuccessDlg.dialog('open');
    },
    error: function(jqXHR, textStatus, errorThrown) {
      tipDlg.dialog('close');
      tipJarDisplayError('Error sending your tip! ' + errorThrown);
    }
  });
}

function tipJarDisplayError(msg) {
  $(tipErrorDlg.find('.errormsg')).html('');
  if (msg) {
    $(tipErrorDlg.find('.errormsg')).text(msg);
  }
  tipErrorDlg.dialog('open');
}

function mintChipApi() {
  return document.getElementById("mintChipApiPlugin");
}

function onMintChipPluginLoaded() {
  try {
    mintChipFactory = mintChipApi().mintChipFactory;
    messageFactory = mintChipApi().messageFactory;
    mintChip = mintChipFactory.createMintChip();
  } catch (err) {
    tipJarDisplayError(err);
    return;
  }

  $(tipJarSelector).click(function() {
    tipDlg.dialog('open');
  });
  $('#tipjarform').submit(function() {
    // FIXME: double-check that parsed amount is equal to string (e.g. no "0.05a")!
    var amountInCents = parseFloat($('#tipjaramt').attr('value')) * 100;
    var valueMessage = createValueMessage('' + amountInCents,
                                          $('#tipjarcmt').attr('value'));
    if (valueMessage) {
      sendTip(valueMessage.toBase64String(), amountInCents,
              $('#tipjarcmt').attr('value'));
    } else {
      tipDlg.dialog('close');
    }
    return false;
  });
}

function tipjar(selector, payeeId, defaultTip) {
  tipJarSelector = selector;
  tipJarPayeeId = payeeId;
  if (defaultTip == null) {
    defaultTip = 1;
  }
  tipJarDefaultTip = defaultTip.toFixed(2);

  setupDialogs();

  $('body').append('<object id="mintChipApiPlugin" type="application/x-mintchipplugin" width="0" height="0"><param name="onload" value="onMintChipPluginLoaded" /></object>');
}

