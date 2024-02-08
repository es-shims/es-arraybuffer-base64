'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.prototype.setFromHex === 'function' ? Uint8Array.prototype.setFromHex : implementation;
};
