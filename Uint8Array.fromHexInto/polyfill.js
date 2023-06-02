'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.fromHexInto === 'function' ? Uint8Array.fromHexInto : implementation;
};
