'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayFromHex() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array,
			{ fromHex: polyfill },
			{ fromHex: function () { return Uint8Array.fromHex !== polyfill; } }
		);
	}

	return polyfill;
};
