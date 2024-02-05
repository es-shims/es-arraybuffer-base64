'use strict';

var $TypeError = require('es-errors/type');

var isInteger = require('es-abstract/helpers/isInteger');

var callBound = require('call-bind/callBound');

var $charCodeAt = callBound('String.prototype.charCodeAt');

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-skipasciiwhitespace

module.exports = function SkipAsciiWhitespace(string, index) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a string');
	}
	if (!isInteger(index) || index < 0) {
		throw new $TypeError('Assertion failed: `index` must be a non-negative integer');
	}

	var length = string.length; // step 1

	while (index < length) { // step 2
		var char = $charCodeAt(string, index); // step 2.a

		if (char !== 0x0009 && char !== 0x000A && char !== 0x000C && char !== 0x000D && char !== 0x0020) { // step 2.b
			return index; // step 2.b.i
		}

		// eslint-disable-next-line no-param-reassign
		index += 1; // step 2.c
	}
	return index; // step 3
};
