'use strict';

require('../auto');

var test = require('tape');
var forEach = require('es-abstract/helpers/forEach');

var shims = require('../');

forEach(shims, function (shim) {
	var shimTests;
	try {
		shimTests = require('./' + shim); // eslint-disable-line global-require
	} catch (e) {
		test(shim + ': shimmed', { todo: true });
	}
	if (shimTests) {
		shimTests.shimmed();
	}
});

test('integration', { skip: typeof Uint8Array !== 'function' }, function (t) {
	var array = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
	var hex = '48656c6c6f20576f726c64';

	t.deepEqual(Uint8Array.fromHex(hex), array, 'hex converts to expected bytes');
	t.equal(array.toHex(), hex, 'array converts to expected hex');

	t.end();
});
