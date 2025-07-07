'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

var DecodeBase64Chunk = require('../aos/DecodeBase64Chunk');
var SkipAsciiWhitespace = require('../aos/SkipAsciiWhitespace');
var substring = require('es-abstract/2025/substring');

var isInteger = require('math-intrinsics/isInteger');
var maxSafeInteger = require('math-intrinsics/constants/maxSafeInteger');

var alphabetFromIdentifier = require('./helpers/alphabetFromIdentifier');

var safeArrayConcat = require('safe-array-concat');

var $strIndexOf = callBound('String.prototype.indexOf');

/* eslint no-redeclare: 0 */

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-frombase64

module.exports = function FromBase64(string, alphabet, lastChunkHandling) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` is not a string: ' + string);
	}
	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + alphabet);
	}
	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('Assertion failed: `lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`');
	}

	var maxLength = arguments.length > 3 ? arguments[3] : maxSafeInteger; // step 1.a
	if (
		arguments.length > 3
        && (!isInteger(maxLength) || maxLength < 0)
	) {
		throw new $TypeError('Assertion failed: `maxLength` is not a non-negative integer: ' + maxLength);
	}

	// 2. NOTE: The order of validation and decoding in the algorithm below is not observable. Implementations are encouraged to perform them in whatever order is most efficient, possibly interleaving validation with decoding, as long as the behaviour is observably equivalent.

	if (maxLength === 0) { // step 3
		return {
			'[[Read]]': 0,
			'[[Bytes]]': [],
			'[[Error]]': null
		}; // step 3.a
	}

	var read = 0; // step 4

	var bytes = []; // step 5

	var chunk = ''; // step 6

	var chunkLength = 0; // step 7

	var index = 0; // step 8

	var length = string.length; // step 9

	// eslint-disable-next-line no-constant-condition
	while (true) { // step 10
		index = SkipAsciiWhitespace(string, index); // step 10.a

		if (index === length) { // step 10.b
			if (chunkLength > 0) { // step 10.b.i
				if (lastChunkHandling === 'stop-before-partial') { // step 10.b.i.1
					return {
						'[[Read]]': read,
						'[[Bytes]]': bytes,
						'[[Error]]': null
					}; // step 10.b.i.1.a
				} else if (lastChunkHandling === 'loose') { // step 10.b.i.2
					if (chunkLength === 1) { // step 10.b.i.2.a
						var error = new $SyntaxError('malformed padding: exactly one additional character'); // step 10.b.i.2.a.i
						return {
							'[[Read]]': read,
							'[[Bytes]]': bytes,
							'[[Error]]': error
						}; // step 10.b.i.2.a.ii
					}

					try {
						bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk, false)); // step 10.b.i.2.b
					} catch (e) {
						return {
							'[[Read]]': read,
							'[[Bytes]]': bytes,
							'[[Error]]': e
						}; // step 10.b.i.2.c ?
					}
				} else { // step 10.b.i.3
					// Assert: lastChunkHandling is "strict".
					var error = new $SyntaxError('missing padding'); // step 10.b.i.3.b
					return {
						'[[Read]]': read,
						'[[Bytes]]': bytes,
						'[[Error]]': error
					}; // step 10.b.i.3.c
				}
			}
			return {
				'[[Read]]': length,
				'[[Bytes]]': bytes,
				'[[Error]]': null
			}; // step 10.b.ii
		}
		var char = substring(string, index, index + 1); // step 10.c

		index += 1; // step 10.d

		if (char === '=') { // step 10.e
			if (chunkLength < 2) { // step 10.e.i
				var error = new $SyntaxError('padding is too early'); // step 10.e.i.1
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': error
				}; // step 10.e.i.2
			}

			index = SkipAsciiWhitespace(string, index); // step 10.e.ii

			if (chunkLength === 2) { // step 10.e.iii
				if (index === length) { // step 10.e.iii.1
					if (lastChunkHandling === 'stop-before-partial') { // step 10.e.iii.1.a
						return {
							'[[Read]]': read,
							'[[Bytes]]': bytes,
							'[[Error]]': null
						}; // step 10.e.iii.1.a.i
					}
					var error = new $SyntaxError('malformed padding - only one ='); // step 10.e.iii.1.b
					return {
						'[[Read]]': read,
						'[[Bytes]]': bytes,
						'[[Error]]': error
					}; // step 10.e.iii.1.c
				}

				char = substring(string, index, index + 1); // step 10.e.iii.2

				if (char === '=') { // step 10.e.iii.3
					index = SkipAsciiWhitespace(string, index + 1); // step 10.e.iii.3.a
				}
			}

			if (index < length) { // step 10.e.iv
				var error = new $SyntaxError('unexpected character after padding'); // step 10.e.iv.1
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': error
				}; // step 10.e.iv.2
			}

			var throwOnExtraBits = lastChunkHandling === 'strict'; // step 10.e.v - vi

			bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk, throwOnExtraBits)); // step 10.e.vii

			return {
				'[[Read]]': length,
				'[[Bytes]]': bytes,
				'[[Error]]': null
			}; // step 10.e.viii
		}

		if (alphabet === 'base64url') { // step 10.f
			if (char === '+' || char === '/') { // step 10.f.i
				var error = new $SyntaxError('unexpected character ' + char); // step 10.f.i.1
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': error
				}; // step 10.f.i.2
			} else if (char === '-') {
				char = '+'; // step 10.f.ii
			} else if (char === '_') {
				char = '/'; // step 10.f.iii
			}
		}

		// g. If char is not an element of the standard base64 alphabet, throw a SyntaxError exception.
		if ($strIndexOf(alphabetFromIdentifier('base64'), char) < 0) { // step 10.g
			var error = new $SyntaxError('unexpected character ' + char); // step 10.g.i
			return {
				'[[Read]]': read,
				'[[Bytes]]': bytes,
				'[[Error]]': error
			}; // step 10.g.ii
		}

		var remaining = maxLength - bytes.length; // step 10.h

		if (
			(remaining === 1 && chunkLength === 2)
            || (remaining === 2 && chunkLength === 3)
		) { // step 10.i
			return {
				'[[Read]]': read,
				'[[Bytes]]': bytes,
				'[[Error]]': null
			}; // step 10.i.1
		}

		chunk += char; // step 10.j

		chunkLength = chunk.length; // step 10.k

		if (chunkLength === 4) { // step 10.l
			bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk)); // step 10.l.i

			chunk = ''; // step 10.l.ii

			chunkLength = 0; // step 10.l.iii

			read = index; // step 10.l.iv

			if (bytes.length >= maxLength) { // step 10.l.v
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': null
				}; // step 10.l.v.1
			}
		}
	}
};
