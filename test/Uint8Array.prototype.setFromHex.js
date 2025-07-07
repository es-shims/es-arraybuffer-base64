'use strict';

var callBind = require('call-bind');
var defineProperties = require('define-properties');
var DetachArrayBuffer = require('es-abstract/2025/DetachArrayBuffer');
var forEach = require('es-abstract/helpers/forEach');
var isCore = require('is-core-module');
var test = require('tape');

/* globals postMessage: false */
var canDetach = typeof structuredClone === 'function' || typeof postMessage === 'function' || isCore('worker_threads');

var index = require('../Uint8Array.prototype.setFromHex');
var impl = require('../Uint8Array.prototype.setFromHex/implementation');

var polyfill = require('../Uint8Array.prototype.setFromHex/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.prototype.setFromHex';

module.exports = {
	tests: function (t, method) {
		t.test('when Uint8Arrays not supported', { skip: typeof Uint8Array === 'function' }, function (st) {
			st['throws'](
				function () { return method(''); },
				SyntaxError,
				'throws SyntaxError when Uint8Arrays are not supported'
			);

			st.end();
		});

		t.test('Uint8Arrays supported', { skip: typeof Uint8Array !== 'function' }, function (st) {
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

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromHex/detached-buffer.js', { skip: !canDetach }, function (s2t) {
				var target = new Uint8Array([255, 255, 255]);
				DetachArrayBuffer(target.buffer);

				s2t['throws'](
					function () { method(target, 'aa'); },
					TypeError
				);

				s2t.end();
			});

			var illegal = [
				'a.a',
				'aa^',
				'a a',
				'a\ta',
				'a\x0Aa',
				'a\x0Ca',
				'a\x0Da',
				'a\u00A0a', // nbsp
				'a\u2009a', // thin space
				'a\u2028a' // line separator
			];
			forEach(illegal, function (value) {
				st['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255]);
						method(target, value);
					},
					SyntaxError
				);
			});

			var cases = [
				['', []],
				['66', [102]],
				['666f', [102, 111]],
				['666F', [102, 111]],
				['666f6f', [102, 111, 111]],
				['666F6f', [102, 111, 111]],
				['666f6f62', [102, 111, 111, 98]],
				['666f6f6261', [102, 111, 111, 98, 97]],
				['666f6f626172', [102, 111, 111, 98, 97, 114]]
			];

			forEach(cases, function (pair) {
				var allFF = [255, 255, 255, 255, 255, 255, 255, 255];
				var target = new Uint8Array(allFF);
				var result = method(target, pair[0]);
				st.deepEqual(result, { read: pair[0].length, written: pair[1].length });

				var expectedResult = new Uint8Array(pair[1].concat(allFF.slice(pair[1].length)));
				st.deepEqual(target, expectedResult, 'decoding ' + pair[0]);
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromHex/string-coercion.js', function (s2t) {
				var throwyToString = {};
				var results = s2t.intercept(throwyToString, 'toString', {
					value: function () {
						throw new EvalError('toString called');
					}
				});

				s2t['throws'](
					function () {
						var target = new Uint8Array(10);
						method(target, throwyToString);
					},
					TypeError
				);
				s2t.deepEqual(results(), []);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromHex/subarray.js', function (s2t) {
				var base = new Uint8Array([255, 255, 255, 255, 255, 255, 255]);
				var subarray = base.subarray(2, 5);

				var result = method(subarray, 'aabbcc');
				s2t.deepEqual(result, { read: 6, written: 3 });
				s2t.deepEqual(subarray, new Uint8Array([170, 187, 204]));
				s2t.deepEqual(base, new Uint8Array([255, 255, 170, 187, 204, 255, 255]));

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromHex/target-size.js', function (s2t) {
				// buffer too small
				var target = new Uint8Array([255, 255]);
				var result = method(target, 'aabbcc');
				s2t.deepEqual(result, { read: 4, written: 2 });
				s2t.deepEqual(target, new Uint8Array([170, 187]));

				// buffer exact
				var target2 = new Uint8Array([255, 255, 255]);
				var result2 = method(target2, 'aabbcc');
				s2t.deepEqual(result2, { read: 6, written: 3 });
				s2t.deepEqual(target2, new Uint8Array([170, 187, 204]));

				// buffer too large
				var target3 = new Uint8Array([255, 255, 255, 255]);
				var result3 = method(target3, 'aabbcc');
				s2t.deepEqual(result3, { read: 6, written: 3 });
				s2t.deepEqual(target3, new Uint8Array([170, 187, 204, 255]));

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromHex/writes-up-to-error', function (s2t) {
				['aaa ', 'aaag'].forEach(function (value) {
					var target = new Uint8Array([255, 255, 255, 255, 255]);
					s2t['throws'](
						function () { method(target, value); },
						SyntaxError
					);
					s2t.deepEqual(target, new Uint8Array([170, 255, 255, 255, 255]), 'decoding from ' + value);
				});

				var target = new Uint8Array([255, 255, 255, 255, 255]);
				s2t['throws'](
					function () { method(target, 'aaa'); },
					SyntaxError
				);
				s2t.deepEqual(target, new Uint8Array([255, 255, 255, 255, 255]), 'when length is odd no data is written');

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromHex/throws-when-string-length-is-odd', function (s2t) {
				var zeroLength = new Uint8Array(0);

				s2t['throws'](
					function () { method(zeroLength, '1'); },
					SyntaxError,
					'Uint8Array has length 0'
				);

				var nonZeroLength = new Uint8Array(1);

				s2t['throws'](
					function () { method(nonZeroLength, '1'); },
					SyntaxError,
					'Uint8Array has length >0'
				);

				s2t.end();
			});

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
