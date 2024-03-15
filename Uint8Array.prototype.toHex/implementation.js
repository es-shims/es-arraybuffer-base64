'use strict';

var GetUint8ArrayBytes = require('../aos/GetUint8ArrayBytes');
var NumberToString = require('es-abstract/2024/Number/toString');
var StringPad = require('es-abstract/2024/StringPad');
var ValidateUint8Array = require('../aos/ValidateUint8Array');

var forEach = require('es-abstract/helpers/forEach');

module.exports = function toHex() {
	var O = this; // step 1

	ValidateUint8Array(O); // step 2

	var toEncode = GetUint8ArrayBytes(O); // step 3

	var out = ''; // step 4

	forEach(toEncode, function (byte) { // step 5
		var hex = NumberToString(byte, 16); // step 5.a

		hex = StringPad(hex, 2, '0', 'start'); // step 5.b

		out += hex; // step 5.c
	});

	return out; // step 6
};
