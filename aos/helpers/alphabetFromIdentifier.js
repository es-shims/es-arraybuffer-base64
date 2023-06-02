'use strict';

var base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var base64UrlCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

module.exports = function alphabetFromIdentifier(alphabet) {
	if (alphabet === 'base64') {
		return base64Characters;
	}

	if (alphabet === 'base64url') {
		return base64UrlCharacters;
	}

	throw new $TypeError('expected alphabet to be either "base64" or "base64url"');
};
