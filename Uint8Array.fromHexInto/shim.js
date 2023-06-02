'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayFromHexInto() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array,
			{ fromHexInto: polyfill },
			{ fromHexInto: function () { return Uint8Array.fromHexInto !== polyfill; } }
		);
	}

	return polyfill;
};
