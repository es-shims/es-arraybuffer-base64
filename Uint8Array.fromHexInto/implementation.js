'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromHex = require('../aos/FromHex');
var IsTypedArrayOutOfBounds = require('../aos/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('../aos/MakeTypedArrayWithBufferWitnessRecord');
var TypedArrayByteLength = require('../aos/TypedArrayByteLength');
var ValidateUint8Array = require('../aos/ValidateUint8Array');
var SetUint8ArrayBytes = require('../aos/SetUint8ArrayBytes');

module.exports = function fromHexInto(string, into) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array'); // step 1
	}

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + string); // step 1
	}

	ValidateUint8Array(into); // step 2

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(into, 'SEQ-CST'); // step 3

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('fromHexInto called on Typed Array backed by detached buffer'); // step 4
	}

	var byteLength = TypedArrayByteLength(taRecord); // step 5

	var maxLength = byteLength; // step 6

	var result = FromHex(string, maxLength); // step 7

	var bytes = result['[[Bytes]]']; // step 8

	var written = bytes.length; // step 9

	// 10. NOTE: FromHex does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 11
	}

	SetUint8ArrayBytes(into, bytes); // step 12

	// var resultObject = {}; // step 13 // OrdinaryObjectCreate(%Object.prototype%)
	// CreateDataPropertyOrThrow(resultObject, 'read', result['[[Read]]']); // step 14
	// CreateDataPropertyOrThrow(resultObject, 'written', written); // step 15
	// return resultObject; // step 16

	return { // steps 13 - 16
		read: result['[[Read]]'],
		written: written
	};
};
