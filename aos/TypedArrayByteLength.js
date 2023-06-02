'use strict';

var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var TypedArrayElementSize = require('es-abstract/2023/TypedArrayElementSize');
var TypedArrayLength = require('./TypedArrayLength');

// var assertRecord = require('es-abstract/helpers/assertRecord');

var typedArrayByteLength = require('typed-array-byte-length');

// https://tc39.es/ecma262/#sec-typedarraybytelength

module.exports = function TypedArrayByteLength(taRecord) {
	// assertRecord(Type, 'TypedArray With Buffer Witness Record', 'taRecord', taRecord);

	if (IsTypedArrayOutOfBounds(taRecord)) {
		return 0; // step 1
	}
	var length = TypedArrayLength(taRecord); // step 2

	if (length === 0) {
		return 0; // step 3
	}

	var O = taRecord['[[Object]]']; // step 4

	var byteLength = typedArrayByteLength(O);
	if (byteLength !== 'AUTO') {
		return byteLength; // step 5
	}

	var elementSize = TypedArrayElementSize(O); // step 6

	return length * elementSize; // step 7
};
