'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromBase64 = require('../aos/FromBase64');
var Get = require('es-abstract/2024/Get');
var GetOptionsObject = require('../aos/GetOptionsObject');
var IsTypedArrayOutOfBounds = require('es-abstract/2024/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('es-abstract/2024/MakeTypedArrayWithBufferWitnessRecord');
var SetUint8ArrayBytes = require('../aos/SetUint8ArrayBytes');
var SetValueInBuffer = require('es-abstract/2024/SetValueInBuffer');
var TypedArrayLength = require('es-abstract/2024/TypedArrayLength');
var ValidateUint8Array = require('../aos/ValidateUint8Array');

var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayBuffer = require('typed-array-buffer');

module.exports = function setFromBase64(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array');
	}

	var into = this; // step 1

	ValidateUint8Array(into); // step 2

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 3
	}

	var opts = GetOptionsObject(arguments.length > 1 ? arguments[1] : void undefined); // step 4

	var alphabet = Get(opts, 'alphabet'); // step 5

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 6
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + (typeof alphabet === 'string' ? alphabet : typeof alphabet)); // step 7
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

	var byteLength = TypedArrayLength(taRecord); // step 13

	var result = FromBase64(string, alphabet, lastChunkHandling, byteLength); // step 14

	if (result['[[Error]]']) { // step 15
		throw result['[[Error]]']; // step 15.a
	}

	var bytes = result['[[Bytes]]']; // step 16

	var written = bytes.length; // step 17

	// 18. NOTE: FromBase64 does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 19
	}

	SetUint8ArrayBytes(into, bytes); // step 20

	var offset = typedArrayByteOffset(into); // step 21

	var index = 0; // step 22

	var intoBuffer = typedArrayBuffer(into);

	while (index < written) { // step 23
		var byte = bytes[index]; // step 23.a

		var byteIndexInBuffer = index + offset; // step 23.b

		SetValueInBuffer(intoBuffer, byteIndexInBuffer, 'UINT8', byte, true, 'UNORDERED'); // step 23.c

		index += 1; // step 23.d
	}

	// 24. Let resultObject be OrdinaryObjectCreate(%Object.prototype%).
	// 25. Perform ! CreateDataPropertyOrThrow(resultObject, "read", 𝔽(result.[[Read]])).
	// 26. Perform ! CreateDataPropertyOrThrow(resultObject, "written", 𝔽(written)).
	// 27. Return resultObject.

	return { // steps 24 - 27
		read: result['[[Read]]'],
		written: written
	};
};
