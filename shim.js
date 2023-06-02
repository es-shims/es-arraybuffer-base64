'use strict';

var fromBase64 = require('./Uint8Array.fromBase64/shim');
var fromBase64Into = require('./Uint8Array.fromBase64Into/shim');
var fromHex = require('./Uint8Array.fromHex/shim');
var fromHexInto = require('./Uint8Array.fromHexInto/shim');
var toBase64 = require('./Uint8Array.prototype.toBase64/shim');
var toHex = require('./Uint8Array.prototype.toHex/shim');

module.exports = function shimArrayBufferBase64() {
	fromBase64();
	fromBase64Into();
	fromHex();
	fromHexInto();
	toBase64();
	toHex();
};
