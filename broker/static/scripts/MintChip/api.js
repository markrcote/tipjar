//
// This file contains MintChip JavaScript api helper class
//

// namespace mint
if (!this.mint) { mint = {}; };

// api singleton class
if (!mint.api) {
    mint.api = function () {
        return {

            init: function (pluginTagId) {

                this.initialized = false;

                this.pluginTagId = pluginTagId;

                if (this.plugin() == undefined) {
                    return false;
                }

                this.messageFactory = this.plugin().messageFactory;
                this.curencyCode = this.plugin().currencyCode;
                this.logType = this.plugin().logType;

                try {
                    this.mintChip = this.plugin().mintChipFactory.createMintChip();
                    this.chipPresent = true;
                }
                catch (err) {
                    this.chipPresent = false;
                }

                this.initialized = true;

                return this.initialized;
            },

            plugin: function () {
                return document.getElementById(this.pluginTagId);
            },

            isValueMessage: function (mimeType) {
                return mimeType.toLowerCase().indexOf("application/vnd.scg.ecn-message") == 0;
            },

            isValueRequestMessage: function (mimeType) {
                return mimeType.toLowerCase().indexOf("application/vnd.scg.ecn-request") == 0;
            },

            formatId: function (id) {
                return id.substring(0, 4) + "-" + id.substring(4, 8) + "-" + id.substring(8, 12) + "-" + id.substring(12, 16);

            },

            formatCurrency: function (cents) {
                return "$" + (cents / 100).toFixed(2);
            },

            formatCurrencyCode: function (code) {
                switch (code) {
                    case this.plugin().currencyCode.CHF: return "CHF";
                    case this.plugin().currencyCode.CAD: return "CAD";
                    case this.plugin().currencyCode.USD: return "USD";
                    case this.plugin().currencyCode.EUR: return "EUR";
                    case this.plugin().currencyCode.GBP: return "GBP";
                    case this.plugin().currencyCode.JPY: return "JPY";
                    case this.plugin().currencyCode.AUD: return "AUD";
                    case this.plugin().currencyCode.INR: return "INR";
                    case this.plugin().currencyCode.RUB: return "RUB";
                    default: return "?";
                }
            },

            readTransactionLog: function (logType, recordsToShow) {

                if (!recordsToShow) {
                    recordsToShow = 20;
                }

                var status = this.mintChip.getStatus();

                // Calculate the start index and the number of entries to read
                var totalCount = 0;
                if (logType == this.logType.CREDIT) {
                    totalCount = status.creditLogCount;
                }
                else {
                    totalCount = status.debitLogCount;
                }

                var startIndex = totalCount - recordsToShow;
                var numOfEntries = recordsToShow;
                if (startIndex < 0) {
                    numOfEntries = recordsToShow + startIndex;
                    startIndex = 0;
                }

                if (numOfEntries < 1) {
                    numOfEntries = 1;
                }

                // Read the MintChip transaction log
                var entries = this.mintChip.readTransactionLog(logType, startIndex, numOfEntries);

                // List entries in the reverse order
                entries.reverse();

                return entries;
            }
        };  // end of the returned object
    } ();              // end of the function call that creates mint.api
}
