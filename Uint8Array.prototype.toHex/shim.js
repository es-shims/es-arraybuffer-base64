'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayPrototypeToHex() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ toHex: polyfill },
			{ toHex: function () { return Uint8Array.prototype.toHex !== polyfill; } }
		);
	}

	return polyfill;
};
