'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayFromBase64Into() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array,
			{ fromBase64Into: polyfill },
			{ fromBase64Into: function () { return Uint8Array.fromBase64Into !== polyfill; } }
		);
	}

	return polyfill;
};
