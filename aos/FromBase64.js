'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var callBound = require('call-bind/callBound');

var DecodeBase64Chunk = require('../aos/DecodeBase64Chunk');
var SkipAsciiWhitespace = require('../aos/SkipAsciiWhitespace');
var substring = require('es-abstract/2023/substring');

var isInteger = require('es-abstract/helpers/isInteger');
var maxSafeInteger = require('es-abstract/helpers/maxSafeInteger');

var alphabetFromIdentifier = require('./helpers/alphabetFromIdentifier');

var safeArrayConcat = require('safe-array-concat');

var $strIndexOf = callBound('String.prototype.indexOf');

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
		return { '[[Read]]': 0, '[[Bytes]]': [] }; // step 3.a
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
					return { '[[Read]]': read, '[[Bytes]]': bytes }; // step 10.b.i.1.a
				} else if (lastChunkHandling === 'loose') { // step 10.b.i.2
					if (chunkLength === 1) { // step 10.b.i.2.a
						throw new $SyntaxError('malformed padding: exactly one additional character'); // step 10.b.i.2.a.1
					}

					bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk, false)); // step 10.b.i.2.b
				} else { // step 10.b.i.3
					// Assert: lastChunkHandling is "strict".
					throw new $SyntaxError('missing padding'); // step 10.b.i.3.b
				}
			}
			return { '[[Read]]': length, '[[Bytes]]': bytes }; // step 10.b.ii
		}
		var char = substring(string, index, index + 1); // step 10.c

		index += 1; // step 10.d

		if (char === '=') { // step 10.e
			if (chunkLength < 2) { // step 10.e.i
				throw new $SyntaxError('padding is too early'); // step 10.e.i.1
			}

			index = SkipAsciiWhitespace(string, index); // step 10.e.ii

			if (chunkLength === 2) { // step 10.e.iii
				if (index === length) { // step 10.e.iii.1
					if (lastChunkHandling === 'stop-before-partial') { // step 10.e.iii.1.a
						return { '[[Read]]': read, '[[Bytes]]': bytes }; // step 10.e.iii.1.a.i
					}
					throw new $SyntaxError('malformed padding - only one ='); // step 10.e.iii.1.b
				}

				char = substring(string, index, index + 1); // step 10.e.iii.2

				if (char === '=') { // step 10.e.iii.3
					index = SkipAsciiWhitespace(string, index + 1); // step 10.e.iii.3.a
				}
			}

			if (index < length) { // step 10.e.iv
				throw new $SyntaxError('unexpected character after padding'); // step 10.e.iv.1
			}

			var throwOnExtraBits = lastChunkHandling === 'string'; // step 10.e.v - vi

			bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk, throwOnExtraBits)); // step 10.e.vii

			return { '[[Read]]': length, '[[Bytes]]': bytes }; // step 10.e.viii
		}

		if (alphabet === 'base64url') { // step 10.f
			if (char === '+' || char === '/') { // step 10.f.i
				throw new $SyntaxError('unexpected character ' + char); // step 10.f.i.1
			} else if (char === '-') {
				char = '+'; // step 10.f.ii
			} else if (char === '_') {
				char = '/'; // step 10.f.iii
			}
		}

		// g. If char is not an element of the standard base64 alphabet, throw a SyntaxError exception.
		if ($strIndexOf(alphabetFromIdentifier('base64'), char) < 0) { // step 10.g
			throw new $SyntaxError('unexpected character ' + char);
		}

		var remaining = maxLength - bytes.length; // step 10.h

		if (
			(remaining === 1 && chunkLength === 2)
            || (remaining === 2 && chunkLength === 3)
		) { // step 10.i
			return { '[[Read]]': read, '[[Bytes]]': bytes }; // step 10.i.1
		}

		chunk += char; // step 10.j

		chunkLength = chunk.length; // step 10.k

		if (chunkLength === 4) { // step 10.l
			bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk)); // step 10.l.i

			chunk = ''; // step 10.l.ii

			chunkLength = 0; // step 10.l.iii

			read = index; // step 10.l.iv

			if (bytes.length >= maxLength) { // step 10.l.v
				return { '[[Read]]': read, '[[Bytes]]': bytes }; // step 10.l.v.1
			}
		}
	}
};
