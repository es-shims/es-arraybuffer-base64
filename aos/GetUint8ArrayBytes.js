'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bind/callBound');

var GetValueFromBuffer = require('es-abstract/2024/GetValueFromBuffer');
var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('./MakeTypedArrayWithBufferWitnessRecord');
var TypedArrayLength = require('./TypedArrayLength');

var typedArrayBuffer = require('typed-array-buffer');
var whichTypedArray = require('which-typed-array');
var typedArrayByteOffset = require('typed-array-byte-offset');

var $push = callBound('Array.prototype.push');

module.exports = function GetUint8ArrayBytes(ta) {
	if (whichTypedArray(ta) !== 'Uint8Array') {
		throw new $TypeError('Assertion failed: `ta` must be a Uint8Array');
	}

	var buffer = typedArrayBuffer(ta); // step 1

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(ta, 'SEQ-CST'); // step 2

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('typed array is out of bounds'); // step 3
	}

	var len = TypedArrayLength(taRecord); // step 4

	var byteOffset = typedArrayByteOffset(ta); // step 5

	var bytes = []; // step 6

	var index = 0; // step 7

	while (index < len) { // step 8
		var byteIndex = byteOffset + index; // step 8.a

		var byte = GetValueFromBuffer(buffer, byteIndex, 'UINT8', true, 'UNORDERED'); // step 8.b

		$push(bytes, byte); // step 8.c

		index += 1; // step 8.d
	}

	return bytes;
};
