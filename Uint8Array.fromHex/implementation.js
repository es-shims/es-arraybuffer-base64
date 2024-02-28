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

	// var resultLength = result['[[Bytes]]']; // step 3

	// 4. Let ta be ? AllocateTypedArray("Uint8Array", %Uint8Array%, "%Uint8Array.prototype%", resultLength).

	// 5. Set the value at each index of ta.[[ViewedArrayBuffer]].[[ArrayBufferData]] to the value at the corresponding index of result.[[Bytes]].

	// 6. Return ta.

	return new $Uint8Array(result['[[Bytes]]']); // steps 3 - 6
};
