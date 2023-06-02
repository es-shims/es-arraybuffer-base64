'use strict';

var defineProperties = require('define-properties');
var test = require('tape');

var index = require('../Uint8Array.fromHex');
var impl = require('../Uint8Array.fromHex/implementation');

var polyfill = require('../Uint8Array.fromHex/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.fromHex';

module.exports = {
	tests: function (t, method) {
		t.test({ skip: typeof Uint8Array === 'function' }, 'Uint8Arrays not supported', function (st) {
			st['throws'](
				function () { return method(''); },
				SyntaxError,
				'throws SyntaxError when Uint8Arrays are not supported'
			);

			st.end();
		});

		t.test({ skip: typeof Uint8Array !== 'function' }, 'Uint8Arrays supported', function (st) {
			st['throws'](
				function () { return method('F'); },
				SyntaxError,
				'throws on odd-numbered length hex strings'
			);

			st['throws'](
				function () { return method('FG'); },
				SyntaxError,
				'throws on invalid hex string characters'
			);

			st.deepEqual(method(''), new Uint8Array([]), 'empty string produces empty array');

			var hex = '';
			var expected = [];
			for (var i = 0; i < 256; i++) {
				hex += ('00' + i.toString(16)).slice(-2);
				expected.push(i);
			}

			st.deepEqual(
				method(hex),
				new Uint8Array(expected),
				'hex (' + hex + ') produces expected bytes (' + expected.join(', ') + ')'
			);

			st.end();
		});
	},
	index: function () {
		test(shimName + ': index', function (t) {
			t.notEqual(index, polyfill, 'index !== polyfill');
			t.equal(typeof index, 'function', 'index is a function');

			t['throws'](
				function () { return new index(); }, // eslint-disable-line new-cap
				TypeError,
				'index throws when Construct-ed'
			);

			module.exports.tests(t, index);

			t.end();
		});
	},
	implementation: function () {
		test(shimName + ': implementation', function (t) {
			t.equal(impl, polyfill, 'implementation is polyfill itself');

			module.exports.tests(t, impl);

			t.end();
		});
	},
	shimmed: function () {
		test(shimName + ': shimmed', function (t) {
			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Uint8Array, 'fromHex'), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, Uint8Array.fromHex);

			t.end();
		});
	}
};
