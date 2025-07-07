'use strict';

require('../auto');

var test = require('tape');

var shims = require('../');

test('shim list', function (t) {
	t.deepEqual(shims, [
		'Uint8Array.fromBase64',
		'Uint8Array.fromHex',
		'Uint8Array.prototype.setFromBase64',
		'Uint8Array.prototype.setFromHex',
		'Uint8Array.prototype.toBase64',
		'Uint8Array.prototype.toHex'
	], 'shim list is as expected');

	t.end();
});

require('./Uint8Array.fromBase64').shimmed();
require('./Uint8Array.fromHex').shimmed();
require('./Uint8Array.prototype.setFromBase64').shimmed();
require('./Uint8Array.prototype.setFromHex').shimmed();
require('./Uint8Array.prototype.toBase64').shimmed();
require('./Uint8Array.prototype.toHex').shimmed();

test('integration', { skip: typeof Uint8Array !== 'function' }, function (t) {
	var array = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
	var hex = '48656c6c6f20576f726c64';

	t.deepEqual(Uint8Array.fromHex(hex), array, 'hex converts to expected bytes');
	t.equal(array.toHex(), hex, 'array converts to expected hex');

	t.end();
});
