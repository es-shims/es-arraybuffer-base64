'use strict';

var defineProperties = require('define-properties');
var test = require('tape');
var forEach = require('es-abstract/helpers/forEach');
var getProto = require('get-proto');

var index = require('../Uint8Array.fromHex');
var impl = require('../Uint8Array.fromHex/implementation');

var polyfill = require('../Uint8Array.fromHex/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.fromHex';

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
				'a\u2028a', // line separator
				'a' // odd length input
			];
			forEach(illegal, function (value) {
				st['throws'](
					function () { method(value); },
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
				var arr = method(pair[0]);
				st.equal(getProto(arr), Uint8Array.prototype, 'decoding ' + pair[0]);
				st.equal(arr.length, pair[1].length, 'decoding ' + pair[0]);
				st.equal(arr.buffer.byteLength, pair[1].length, 'decoding ' + pair[0]);
				st.deepEqual(arr, new Uint8Array(pair[1]), 'decoding ' + pair[0]);
			});

			st.test('test262: test/built-ins/Uint8Array/fromHex/string-coercion.js', function (s2t) {
				var throwyToString = {};
				var results = s2t.intercept(
					throwyToString,
					'toString',
					{ value: function () { throw new EvalError('toString called'); } }
				);

				s2t['throws'](
					function () { method(throwyToString); },
					TypeError
				);
				s2t.deepEqual(results(), []);

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
