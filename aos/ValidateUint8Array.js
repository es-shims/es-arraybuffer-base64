'use strict';

var $TypeError = require('es-errors/type');

var whichTypedArray = require('which-typed-array');

module.exports = function ValidateUint8Array(ta) {
	if (whichTypedArray(ta) !== 'Uint8Array') {
		throw new $TypeError('`this` value must be a Uint8Array'); // steps 1 - 2
	}
};
