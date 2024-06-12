'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromHex = require('../aos/FromHex');

module.exports = function fromHex(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array'); // step 1
	}

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 1
	}

	var result = FromHex(string); // step 2

	if (result['[[Error]]']) { // step 3
		throw result['[[Error]]']; // step 3.a
	}

	// var resultLength = result['[[Bytes]]']; // step 4

	// 5. Let ta be ? AllocateTypedArray("Uint8Array", %Uint8Array%, "%Uint8Array.prototype%", resultLength).

	// 6. Set the value at each index of ta.[[ViewedArrayBuffer]].[[ArrayBufferData]] to the value at the corresponding index of result.[[Bytes]].

	// 7. Return ta.

	return new $Uint8Array(result['[[Bytes]]']); // steps 4 - 7
};
