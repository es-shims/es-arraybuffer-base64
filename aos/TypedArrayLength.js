'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var floor = require('es-abstract/2023/floor');
var IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var TypedArrayElementSize = require('es-abstract/2023/TypedArrayElementSize');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayLength = require('typed-array-length');

module.exports = function TypedArrayLength(taRecord) {
	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` is out of bounds'); // step 1
	}

	var O = taRecord['[[Object]]']; // step 2

	var length = typedArrayLength(O);
	if (length !== 'AUTO') {
		return length; // step 3
	}

	if (IsFixedLengthArrayBuffer(typedArrayBuffer(O))) {
		throw new $TypeError('Assertion failed: array buffer is not fixed length'); // step 4
	}

	var byteOffset = typedArrayByteOffset(O); // step 5

	var elementSize = TypedArrayElementSize(O); // step 6

	var byteLength = taRecord['[[CachedBufferByteLength]]']; // step 7

	if (byteLength === 'DETACHED') {
		throw new $TypeError('Assertion failed: typed array is detached'); // step 8
	}

	return floor((byteLength - byteOffset) / elementSize); // step 9
};
