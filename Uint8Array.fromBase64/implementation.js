'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromBase64 = require('../aos/FromBase64');
var Get = require('es-abstract/2025/Get');
var GetOptionsObject = require('../aos/GetOptionsObject');

module.exports = function fromBase64(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array');
	}

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 1
	}

	var opts = GetOptionsObject(arguments.length > 1 ? arguments[1] : void undefined); // step 2

	var alphabet = Get(opts, 'alphabet'); // step 3

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 4
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + (typeof alphabet === 'string' ? alphabet : typeof alphabet)); // step 5
	}

	var lastChunkHandling = Get(opts, 'lastChunkHandling'); // step 6

	if (typeof lastChunkHandling === 'undefined') {
		lastChunkHandling = 'loose'; // step 7
	}

	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('`lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`'); // step 8
	}

	var result = FromBase64(string, alphabet, lastChunkHandling); // step 9

	if (result['[[Error]]']) { // step 10
		throw result['[[Error]]']; // step 10.a
	}

	// var resultLength = result['[[Bytes]]']; // step 11

	// 12. Let ta be ? AllocateTypedArray("Uint8Array", %Uint8Array%, "%Uint8Array.prototype%", resultLength).

	// 13. Set the value at each index of ta.[[ViewedArrayBuffer]].[[ArrayBufferData]] to the value at the corresponding index of result.[[Bytes]].

	// 14. Return ta.

	return new $Uint8Array(result['[[Bytes]]']); // step 11 - 14
};
