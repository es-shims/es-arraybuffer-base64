'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArraySetFromBase64() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ setFromBase64: polyfill },
			{ setFromBase64: function () { return Uint8Array.prototype.setFromBase64 !== polyfill; } }
		);
	}

	return polyfill;
};
