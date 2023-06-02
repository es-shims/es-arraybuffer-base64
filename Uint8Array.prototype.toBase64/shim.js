'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayPrototypeToBase64() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ toBase64: polyfill },
			{ toBase64: function () { return Uint8Array.prototype.toBase64 !== polyfill; } }
		);
	}

	return polyfill;
};
