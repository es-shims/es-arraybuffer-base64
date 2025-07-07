'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromHex = require('../aos/FromHex');
var IsTypedArrayOutOfBounds = require('es-abstract/2025/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('es-abstract/2025/MakeTypedArrayWithBufferWitnessRecord');
var TypedArrayLength = require('es-abstract/2025/TypedArrayLength');
var ValidateUint8Array = require('../aos/ValidateUint8Array');
var SetUint8ArrayBytes = require('../aos/SetUint8ArrayBytes');

module.exports = function setFromHex(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array'); // step 1
	}

	var into = this; // step 1

	ValidateUint8Array(into); // step 2

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 3
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(into, 'SEQ-CST'); // step 4

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('fromHexInto called on Typed Array backed by detached buffer'); // step 5
	}

	var byteLength = TypedArrayLength(taRecord); // step 6

	var result = FromHex(string, byteLength); // step 7

	var bytes = result['[[Bytes]]']; // step 8

	var written = bytes.length; // step 9

	// 10. NOTE: FromHex does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 11
	}

	SetUint8ArrayBytes(into, bytes); // step 12

	if (result['[[Error]]']) { // step 13
		throw result['[[Error]]']; // step 13.a
	}

	// var resultObject = {}; // step 14 // OrdinaryObjectCreate(%Object.prototype%)
	// CreateDataPropertyOrThrow(resultObject, 'read', result['[[Read]]']); // step 15
	// CreateDataPropertyOrThrow(resultObject, 'written', written); // step 16
	// return resultObject; // step 17

	return { // steps 14 - 17
		read: result['[[Read]]'],
		written: written
	};
};
