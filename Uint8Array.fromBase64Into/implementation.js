'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromBase64 = require('../aos/FromBase64');
var Get = require('es-abstract/2023/Get');
var GetOptionsObject = require('../aos/GetOptionsObject');
var IsTypedArrayOutOfBounds = require('../aos/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('../aos/MakeTypedArrayWithBufferWitnessRecord');
var SetUint8ArrayBytes = require('../aos/SetUint8ArrayBytes');
var SetValueInBuffer = require('es-abstract/2023/SetValueInBuffer');
var TypedArrayByteLength = require('../aos/TypedArrayByteLength');
var ValidateUint8Array = require('../aos/ValidateUint8Array');

var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayBuffer = require('typed-array-buffer');

module.exports = function fromBase64Into(string, into) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array');
	}

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + string); // step 1
	}

	ValidateUint8Array(into); // step 2

	var opts = GetOptionsObject(arguments.length > 2 ? arguments[2] : void undefined); // step 3

	var alphabet = Get(opts, 'alphabet'); // step 4

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 5
	}

	if (typeof alphabet !== 'string') {
		throw new $TypeError('`alphabet` is not a string: ' + alphabet); // step 6
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + alphabet); // step 7
	}

	var lastChunkHandling = Get(opts, 'lastChunkHandling'); // step 8

	if (typeof lastChunkHandling === 'undefined') {
		lastChunkHandling = 'loose'; // step 9
	}

	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('`lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`'); // step 10
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(into, 'SEQ-CST'); // step 11

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('typed array is out of bounds'); // step 12
	}

	var byteLength = TypedArrayByteLength(taRecord); // step 13

	var maxLength = byteLength; // step 14

	var result = FromBase64(string, alphabet, lastChunkHandling, maxLength); // step 15

	var bytes = result['[[Bytes]]']; // step 16

	var written = bytes.length; // step 17

	// 18. NOTE: FromBase64 does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 19
	}

	SetUint8ArrayBytes(into, bytes); // step 20

	var offset = typedArrayByteOffset(into); // step 20

	var index = 0; // step 21

	var intoBuffer = typedArrayBuffer(into);

	while (index < written) { // step 22
		var byte = bytes[index]; // step 22.a

		var byteIndexInBuffer = index + offset; // step 22.b

		SetValueInBuffer(intoBuffer, byteIndexInBuffer, 'Uint8', byte, true, 'Unordered'); // step 22.c

		index += 1; // step 22.d
	}

	// 23. Let resultObject be OrdinaryObjectCreate(%Object.prototype%).
	// 24. Perform ! CreateDataPropertyOrThrow(resultObject, "read", 𝔽(result.[[Read]])).
	// 25. Perform ! CreateDataPropertyOrThrow(resultObject, "written", 𝔽(written)).
	// 26. Return resultObject.

	return { // steps 23 - 26
		read: result['[[Read]]'],
		written: written
	};
};
