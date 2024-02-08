'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
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

module.exports = function setFromBase64(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array');
	}

	var into = this; // step 1

	ValidateUint8Array(into); // step 2

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + string); // step 3
	}

	var opts = GetOptionsObject(arguments.length > 1 ? arguments[1] : void undefined); // step 4

	var alphabet = Get(opts, 'alphabet'); // step 5

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 6
	}

	if (typeof alphabet !== 'string') {
		throw new $TypeError('`alphabet` is not a string: ' + alphabet); // step 7
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + alphabet); // step 8
	}

	var lastChunkHandling = Get(opts, 'lastChunkHandling'); // step 9

	if (typeof lastChunkHandling === 'undefined') {
		lastChunkHandling = 'loose'; // step 10
	}

	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('`lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`'); // step 11
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(into, 'SEQ-CST'); // step 12

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('typed array is out of bounds'); // step 13
	}

	var byteLength = TypedArrayByteLength(taRecord); // step 14

	var maxLength = byteLength; // step 15

	var result = FromBase64(string, alphabet, lastChunkHandling, maxLength); // step 16

	var bytes = result['[[Bytes]]']; // step 17

	var written = bytes.length; // step 18

	// 19. NOTE: FromBase64 does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 20
	}

	SetUint8ArrayBytes(into, bytes); // step 21

	var offset = typedArrayByteOffset(into); // step 22

	var index = 0; // step 23

	var intoBuffer = typedArrayBuffer(into);

	while (index < written) { // step 24
		var byte = bytes[index]; // step 24.a

		var byteIndexInBuffer = index + offset; // step 24.b

		SetValueInBuffer(intoBuffer, byteIndexInBuffer, 'Uint8', byte, true, 'Unordered'); // step 24.c

		index += 1; // step 24.d
	}

	// 25. Let resultObject be OrdinaryObjectCreate(%Object.prototype%).
	// 26. Perform ! CreateDataPropertyOrThrow(resultObject, "read", 𝔽(result.[[Read]])).
	// 27. Perform ! CreateDataPropertyOrThrow(resultObject, "written", 𝔽(written)).
	// 28. Return resultObject.

	return { // steps 25 - 28
		read: result['[[Read]]'],
		written: written
	};
};
