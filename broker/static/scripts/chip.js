var mintChipFactory;
var messageFactory;
var mintChip;

function checkChip() {
  if (!mintChipFactory || !messageFactory || !mintChip) {
    displayMsg('No MintChip detected! Is your MintChip connected and the browser plug-in installed?');
    return false;
  }
  return true;
}

function mintChipApi() {
  return document.getElementById("mintChipApiPlugin");
}

function noMintChip() {
  $('#loadedmintchipid').text('not found');
}

function onMintChipPluginLoaded() {
  try {
    mintChipFactory = mintChipApi().mintChipFactory;
    messageFactory = mintChipApi().messageFactory;
    mintChip = mintChipFactory.createMintChip();
  } catch (err) {
    if (err == 'No MintChip found.') {
      noMintChip();
    } else {
      displayError(err);
    }
  }
  if (mintChip) {
    $('#loadedmintchipid').text(mintChip.id);
  }
}

function addChipId(userUrl) {
  if (!checkChip()) {
    return;
  }
  $.ajax({
    url: apiurls.mintchip,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({mintchip_id: mintChip.id, user: apiurls.user }),
    dataType: 'json',
    success: function() { loadChipIds(); }
  });
}

function deleteChipId(chipId, chipUrl) {
  displayYesNo('Really delete MintChip ' + chipId + '?', function() {
    $.ajax({
      url: chipUrl,
      type: 'DELETE',
      dataType: 'json',
      success: function() { loadChipIds(); }
    });
  });
}
