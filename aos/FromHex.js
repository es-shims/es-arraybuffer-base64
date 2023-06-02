'use strict';

var GetIntrinsic = require('get-intrinsic');

var $parseInt = GetIntrinsic('%parseInt%');
var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');

var modulo = require('es-abstract/2023/modulo');
var substring = require('es-abstract/2023/substring');

var isInteger = require('es-abstract/helpers/isInteger');
var MAX_SAFE_INTEGER = require('es-abstract/helpers/maxSafeInteger');

var callBound = require('call-bind/callBound');
var safeRegexTest = require('safe-regex-test');

var isHexDigit = safeRegexTest(/^[0-9a-fA-F]+$/);
var $push = callBound('Array.prototype.push');

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-fromhex

module.exports = function FromHex(string) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a string');
	}
	var maxLength = arguments.length > 1 ? arguments[1] : MAX_SAFE_INTEGER; // step 1
	if (arguments.length > 1 && (!isInteger(maxLength) || maxLength < 0)) {
		throw new $TypeError('Assertion failed: `maxLength` must be a non-negative integer: ' + maxLength);
	}

	var length = string.length; // step 2

	if (modulo(length, 2) !== 0) {
		throw new $SyntaxError('string should be an even number of characters'); // step 3
	}

	var bytes = []; // step 4

	var index = 0; // step 5

	while (index < length && bytes.length < maxLength) { // step 6
		var hexits = substring(string, index, index + 2); // step 6.a

		if (!isHexDigit(hexits)) {
			throw new $SyntaxError('string should only contain hex characters'); // step 6.b
		}

		index += 2; // step 6.c

		var byte = $parseInt(hexits, 16); // step 6.d

		$push(bytes, byte); // step 6.e
	}
	return { '[[Read]]': index, '[[Bytes]]': bytes }; // step 7
};
