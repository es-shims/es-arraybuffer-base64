'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArraySetFromHex() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ setFromHex: polyfill },
			{ setFromHex: function () { return Uint8Array.prototype.setFromHex !== polyfill; } }
		);
	}

	return polyfill;
};
