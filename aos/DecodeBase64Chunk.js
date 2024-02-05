'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var base64Map = {
	__proto__: null,
	0: 52,
	1: 53,
	2: 54,
	3: 55,
	4: 56,
	5: 57,
	6: 58,
	7: 59,
	8: 60,
	9: 61,
	'+': 62,
	'/': 63
};
var getBase64Index = function (c) {
	if (c in base64Map) {
		return base64Map[c];
	}
	var code = c.charCodeAt(0);
	return code < 97 ? code - 65 : code - 71;
};

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-decodebase64chunk

module.exports = function DecodeBase64Chunk(chunk) {
	if (typeof chunk !== 'string') {
		throw new $TypeError('Assertion failed: `chunk` must be a string');
	}

	var throwOnExtraBits = arguments.length > 1 ? !!arguments[1] : false;

	if (arguments.length > 1 && typeof throwOnExtraBits !== 'boolean') {
		throw new $TypeError('Assertion failed: `throwOnExtraBits`, if provided, must be a boolean');
	}

	var chunkLength = chunk.length; // step 1

	if (chunkLength === 2) { // step 2
		chunk += 'AA';
	} else if (chunkLength === 3) { // step 3
		chunk += 'A';
	} else { // step 4
		if (chunkLength !== 4) { // eslint-disable-line no-lonely-if
			throw new $TypeError('Assertion failed: `chunk` must be 2, 3, or 4 characters long (got ' + chunk + ')'); // step 4.a
		}
	}

	// 5. Let byteSequence be the unique sequence of 3 bytes resulting from decoding chunk as base64 (such that applying the base64 encoding specified in section 4 of RFC 4648 to byteSequence would produce chunk).
	// 6. Let bytes be a List whose elements are the elements of byteSequence, in order.

	var c1 = chunk[0];
	var c2 = chunk[1];
	var c3 = chunk[2];
	var c4 = chunk[3];

	var triplet = (getBase64Index(c1) << 18)
        + (getBase64Index(c2) << 12)
        + (getBase64Index(c3) << 6)
        + getBase64Index(c4);

	var bytes = [
		(triplet >> 16) & 255,
		(triplet >> 8) & 255,
		triplet & 255
	];

	if (chunkLength === 2) { // step 7
		if (arguments.length < 2) {
			throw new $TypeError('Assertion failed: `throwOnExtraBits` must be provided if `chunk` is 2 characters long'); // step 7.a
		}
		if (throwOnExtraBits && bytes[1] !== 0) { // step 7.b
			throw new $SyntaxError('extra bits'); // step 7.b.i
		}
		return [bytes[0]]; // step 7.c
	} else if (chunkLength === 3) { // step 8
		if (arguments.length < 2) {
			throw new $TypeError('Assertion failed: `throwOnExtraBits` must be provided if `chunk` is 3 characters long'); // step 8.a
		}
		if (throwOnExtraBits && bytes[2] !== 0) { // step 8.b
			throw new $SyntaxError('extra bits'); // step 8.b.i
		}

		return [bytes[0], bytes[1]]; // step 8.c
	} // step 9
	return bytes; // step 9.a

};
