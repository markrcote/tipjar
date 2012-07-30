var main = null;

$(document).ready(function() {
  setupDialogs();
  if (main) {
    main();
  }
  setTimeout(function() {
    if (!mintChip) {
      noMintChip();
    }
  }, 15000);
});
