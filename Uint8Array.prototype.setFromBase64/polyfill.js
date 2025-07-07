'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	if (typeof Uint8Array === 'function' && typeof Uint8Array.setFromBase64 === 'function') {
		try {
			Uint8Array.setFromBase64('a');
		} catch (e) {
			return Uint8Array.setFromBase64;
		}
	}
	return implementation;
};
