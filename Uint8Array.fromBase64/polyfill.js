'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	if (typeof Uint8Array === 'function' && typeof Uint8Array.fromBase64 === 'function') {
		try {
			Uint8Array.fromBase64('a');
		} catch (e) {
			return Uint8Array.fromBase64;
		}
	}
	return implementation;
};
