'use strict';

var SetValueInBuffer = require('es-abstract/2025/SetValueInBuffer');
var ValidateUint8Array = require('./ValidateUint8Array');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-writeuint8arraybytes

module.exports = function SetUint8ArrayBytes(into, bytes) {
	ValidateUint8Array(into);

	var offset = typedArrayByteOffset(into); // step 1

	var len = bytes.length; // step 2

	var index = 0; // step 3

	while (index < len) { // step 4
		var byte = bytes[index]; // step 4.a
		var byteIndexInBuffer = index + offset; // step 4.b
		SetValueInBuffer(typedArrayBuffer(into), byteIndexInBuffer, 'UINT8', byte, true, 'UNORDERED'); // step 4.c
		index += 1; // step 4.d
	}
};
