'use strict';

var defineProperties = require('define-properties');
var test = require('tape');
var callBind = require('call-bind');

var index = require('../Uint8Array.prototype.setFromHex');
var impl = require('../Uint8Array.prototype.setFromHex/implementation');

var polyfill = require('../Uint8Array.prototype.setFromHex/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.prototype.setFromHex';

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
			var arr = new Uint8Array(256);
			arr[0] = 1;

			st['throws'](
				function () { return method(arr, 'F'); },
				SyntaxError,
				'throws on odd-numbered length hex strings'
			);

			st['throws'](
				function () { return method(arr, 'FG'); },
				SyntaxError,
				'throws on invalid hex string characters'
			);

			var expectedArr = new Uint8Array(256);
			expectedArr[0] = 1;
			st.deepEqual(arr, expectedArr, 'initial `arr`');
			st.deepEqual(method(arr, ''), { read: 0, written: 0 }, 'empty string makes no changes');
			st.deepEqual(arr, expectedArr, '`arr`, no changes');

			var hex = '';
			var expected = [];
			for (var i = 0; i < 256; i++) {
				hex += ('00' + i.toString(16)).slice(-2);
				expected.push(i);
			}

			st.deepEqual(
				method(arr, hex),
				{ read: 512, written: 256 },
				'return object is as expected'
			);
			st.deepEqual(
				arr,
				new Uint8Array(expected),
				'hex (' + hex + ') produces expected bytes (' + expected.join(', ') + ') into `arr`'
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

			module.exports.tests(t, callBind(impl));

			t.end();
		});
	},
	shimmed: function () {
		test(shimName + ': shimmed', function (t) {
			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Uint8Array.prototype, 'setFromHex'), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, callBind(Uint8Array.prototype.setFromHex));

			t.end();
		});
	}
};
