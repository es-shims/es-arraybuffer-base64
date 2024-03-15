'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromHex = require('../aos/FromHex');
var IsTypedArrayOutOfBounds = require('es-abstract/2024/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('es-abstract/2024/MakeTypedArrayWithBufferWitnessRecord');
var TypedArrayByteLength = require('es-abstract/2024/TypedArrayByteLength');
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

	var byteLength = TypedArrayByteLength(taRecord); // step 6

	var maxLength = byteLength; // step 7

	var result = FromHex(string, maxLength); // step 8

	var bytes = result['[[Bytes]]']; // step 9

	var written = bytes.length; // step 10

	// 11. NOTE: FromHex does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 12
	}

	SetUint8ArrayBytes(into, bytes); // step 13

	// var resultObject = {}; // step 14 // OrdinaryObjectCreate(%Object.prototype%)
	// CreateDataPropertyOrThrow(resultObject, 'read', result['[[Read]]']); // step 15
	// CreateDataPropertyOrThrow(resultObject, 'written', written); // step 16
	// return resultObject; // step 17

	return { // steps 14 - 17
		read: result['[[Read]]'],
		written: written
	};
};
