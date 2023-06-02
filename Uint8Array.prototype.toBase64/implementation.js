'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var Get = require('es-abstract/2023/Get');
var ValidateUint8Array = require('../aos/ValidateUint8Array');
var GetOptionsObject = require('../aos/GetOptionsObject');

var alphabetFromIdentifier = require('../aos/helpers/alphabetFromIdentifier');

var callBound = require('es-abstract/helpers/callBound');

var $charAt = callBound('String.prototype.charAt');

module.exports = function toBase64() {
	var O = this; // step 1

	ValidateUint8Array(O); // step 2

	var options = arguments.length > 0 ? arguments[0] : void undefined;
	var opts = GetOptionsObject(options); // step 3

	var alphabet = Get(opts, 'alphabet'); // step 4

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 5
	}

	if (typeof alphabet !== 'string') {
		throw new $TypeError('`alphabet` is not a string: ' + alphabet); // step 6
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Invalid alphabet'); // step 7
	}

	// if (alphabet === 'base64') { // step 8
	// 		a. Let outAscii be the sequence of code points which results from encoding toEncode according to the base64 encoding specified in section 4 of RFC 4648.
	// } else { // step 9
	// 		a. Assert: alphabet is "base64url".
	// 		b. Let outAscii be the sequence of code points which results from encoding toEncode according to the base64url encoding specified in section 5 of RFC 4648.
	// }

	// return CodePointsToString(outAscii); // step 10

	// code adapted from https://github.com/tc39/proposal-arraybuffer-base64/blob/22228812214d5a1c2966cd626f43be3576e79290/playground/polyfill-core.mjs
	var lookup = alphabetFromIdentifier(alphabet);
	var result = '';

	var i = 0;
	var triplet;
	for (; i + 2 < O.length; i += 3) {
		triplet = (O[i] << 16) + (O[i + 1] << 8) + O[i + 2];
		result += $charAt(lookup, (triplet >> 18) & 63)
			+ $charAt(lookup, (triplet >> 12) & 63)
			+ $charAt(lookup, (triplet >> 6) & 63)
			+ $charAt(lookup, triplet & 63);
	}
	if (i + 2 === O.length) {
		triplet = (O[i] << 16) + (O[i + 1] << 8);
		result += $charAt(lookup, (triplet >> 18) & 63)
			+ $charAt(lookup, (triplet >> 12) & 63)
			+ $charAt(lookup, (triplet >> 6) & 63)
			+ '=';
	} else if (i + 1 === O.length) {
		triplet = O[i] << 16;
		result += $charAt(lookup, (triplet >> 18) & 63)
			+ $charAt(lookup, (triplet >> 12) & 63)
			+ '==';
	}
	return result;
};
