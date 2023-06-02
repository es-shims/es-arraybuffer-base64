'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayFromBase64() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array,
			{ fromBase64: polyfill },
			{ fromBase64: function () { return Uint8Array.fromBase64 !== polyfill; } }
		);
	}

	return polyfill;
};
