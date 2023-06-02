'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.fromBase64Into === 'function' ? Uint8Array.fromBase64Into : implementation;
};
