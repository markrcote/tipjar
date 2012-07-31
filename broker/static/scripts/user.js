var tips = {};
var chipIds = {};
var newTipTable;
var oldTipTable;

function isoDateTime(d) {
  function pad(n) { return n < 10 ? '0' + n : n; }
  return d.getFullYear() + '-'
    + pad(d.getMonth()+1) + '-'
    + pad(d.getDate()) + ' '
    + pad(d.getHours()) + ':'
    + pad(d.getMinutes()) + ':'
    + pad(d.getSeconds());
}

function isoUTCDateTime(d) {
  function pad(n) { return n < 10 ? '0' + n : n; }
  return d.getUTCFullYear() + '-'
    + pad(d.getUTCMonth()+1) + '-'
    + pad(d.getUTCDate()) + ' '
    + pad(d.getUTCHours()) + ':'
    + pad(d.getUTCMinutes()) + ':'
    + pad(d.getUTCSeconds());
}

function decodeValueMessage(b64ValueMessage) {
  return messageFactory.toMessage(b64ValueMessage);
}

function deposit(tipId) {
  if (!checkChip()) {
    return;
  }
  var tip = tips[tipId];
  var vm = null;
  try {
    vm = decodeValueMessage(tip['value_msg']);
  } catch (err) {
    console.log(err);
    displayError(err);
    return;
  }
  if (!vm) {
    displayError('Invalid Value Message!');
    return;
  }
  try {
    mintChip.loadValueMessage(vm);
  } catch (err) {
    console.log(err);
    displayError(err);
    return;
  }
  $.ajax({
    url: apiurls.valuemessage + tipId + '/',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({collected_when: isoUTCDateTime(new Date()) }),
    dataType: 'json',
    success: function() {
      displayMsg('Successfully deposited $' + (vm.amount / 100) + ' to ' +
                 vm.payeeId + ' from ' + vm.payerId  + '.');
      loadTips();
    }
  });
}

function loadTips() {
  $.getJSON(apiurls['valuemessage'] + '?limit=0', function(data) {
    var newTipData = [], oldTipData = [], tip;
    for (var i = 0; i < data['objects'].length; i++) {
      tip = data['objects'][i];
      tips[tip['id']] = tip;
      if (tip['collected_when']) {
        oldTipData.push([
          isoDateTime(new Date(tip['added_when'])),
          isoDateTime(new Date(tip['collected_when'])),
          tip['dest_mintchip_id'],
          (tip['amount']/100).toFixed(2),
          tip['comment']
        ]);
      } else {
        newTipData.push([
          isoDateTime(new Date(tip['added_when'])),
          tip['dest_mintchip_id'],
          (tip['amount']/100).toFixed(2),
          tip['comment'],
          '<button onclick="deposit(\'' + tip['id'] + '\')">$</button>'
        ]);
      }
    }
    if (newTipTable) {
      newTipTable.fnDestroy();
      $('#newtiptable').html('');
    }
    if (oldTipTable) {
      oldTipTable.fnDestroy();
      $('#oldtiptable').html('');
    }
    newTipTable = $('#newtiptable').dataTable({
      aoColumns: [
        { sTitle: 'Sent', sWidth: '25%' },
        { sTitle: 'Destination MintChip ID' },
        { sTitle: 'Amount', sType: 'numeric' },
        { sTitle: 'Comment' },
        { sTitle: '', sType: 'html', bSortable: false }
      ],
      aaData: newTipData,
      bJQueryUI: true
    });
    oldTipTable = $('#oldtiptable').dataTable({
      aoColumns: [
        { sTitle: 'Sent', sWidth: '25%' },
        { sTitle: 'Deposited', sWidth: '25%' },
        { sTitle: 'Destination MintChip ID' },
        { sTitle: 'Amount', sType: 'numeric' },
        { sTitle: 'Comment' }
      ],
      aaData: oldTipData,
      bJQueryUI: true
    });
  });
}

var chipTable;

function loadChipIds(callback) {
  $.getJSON(apiurls['mintchip'] + '?limit=0', function(data) {
    var aaData = [], mintChip;
    for (var i = 0; i < data['objects'].length; i++) {
      mintChip = data['objects'][i];
      aaData.push([mintChip['mintchip_id'],'<button onclick="deleteChipId(\'' + mintChip['mintchip_id'] + '\', \'' + mintChip['resource_uri'] + '\')">X</button>']);
      chipIds[mintChip['resource_uri']] = mintChip;
    }
    if (chipTable) {
      chipTable.fnDestroy();
      $('#chipidtable').html('');
    }
    chipTable = $('#chipidtable').dataTable({
      'aoColumns': [
        { 'sTitle': 'MintChipId' },
        { sTitle: '', sType: 'html', sWidth: '5%', bSortable: false }
      ],
      'aaData': aaData,
      bJQueryUI: true
    });
    if (callback) {
      callback();
    }
  });
}

main = function() {
  loadChipIds(function() {
    loadTips();
  });
  $('#helpdialog').dialog({
    autoOpen: false,
    title: 'tipjar broker help',
    width: 800
  });
  $('#helpdialog .closebtn').click(function() {
    $('#helpdialog').dialog('close');
  });
  $('#helpbtn').click(function() {
    $('#helpdialog').dialog('open');
  });
};
