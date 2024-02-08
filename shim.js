'use strict';

var fromBase64 = require('./Uint8Array.fromBase64/shim');
var fromHex = require('./Uint8Array.fromHex/shim');
var setFromBase64 = require('./Uint8Array.prototype.setFromBase64/shim');
var setFromHex = require('./Uint8Array.prototype.setFromHex/shim');
var toBase64 = require('./Uint8Array.prototype.toBase64/shim');
var toHex = require('./Uint8Array.prototype.toHex/shim');

module.exports = function shimArrayBufferBase64() {
	fromBase64();
	fromHex();
	setFromBase64();
	setFromHex();
	toBase64();
	toHex();
};
