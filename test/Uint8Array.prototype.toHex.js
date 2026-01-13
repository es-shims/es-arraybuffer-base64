'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var callBind = require('call-bind');
var defineProperties = require('define-properties');
var DetachArrayBuffer = require('es-abstract/2025/DetachArrayBuffer');
var forEach = require('es-abstract/helpers/forEach');
var inspect = require('object-inspect');
var isCore = require('is-core-module');
var test = require('tape');

/* globals postMessage: false */
var canDetach = typeof structuredClone === 'function' || typeof postMessage === 'function' || isCore('worker_threads');

var index = require('../Uint8Array.prototype.toHex');
var impl = require('../Uint8Array.prototype.toHex/implementation');

var polyfill = require('../Uint8Array.prototype.toHex/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var methodName = 'toHex';
var shimName = 'Uint8Array.prototype.' + methodName;

module.exports = {
	tests: function (t, method) {
		t.test('when Uint8Arrays not supported', { skip: typeof Uint8Array === 'function' }, function (st) {
			st['throws'](
				function () { return method(); },
				SyntaxError,
				'throws SyntaxError when Uint8Arrays are not supported'
			);

			st.end();
		});

		t.test('Uint8Arrays supported', { skip: typeof Uint8Array !== 'function' }, function (st) {
			st.deepEqual(method(new Uint8Array([])), '', 'empty array produces empty string');

			var array = new Uint8Array([251, 255, 191]);
			st.equal(
				method(array),
				'fbffbf',
				inspect(array) + ' produces expected hex string'
			);

			var array2 = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
			st.equal(
				method(array2),
				'48656c6c6f20576f726c64',
				inspect(array2) + ' produces expected hex string'
			);

			st.test('test262: test/built-ins/Uint8Array/prototype/toHex/detached-buffer.js', { skip: !canDetach }, function (s2t) {
				var arr = new Uint8Array(2);
				DetachArrayBuffer(arr.buffer);
				s2t['throws'](
					function () { method(arr); },
					TypeError
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/toHex/receiver-not-uint8array.js', {
				skip: !defineProperties.supportsDescriptors
			}, function (s2t) {
				var options = {};
				s2t.intercept(options, 'alphabet', {
					get: function () {
						throw new EvalError('options.alphabet accessed despite incompatible receiver');
					}
				});

				forEach(availableTypedArrays, function (taName) {
					if (taName === 'Uint8Array') { return; }
					var TA = global[taName];
					var sample = new TA(2);
					s2t['throws'](
						function () { method(sample, options); },
						TypeError,
						'throws with ' + taName
					);
				});

				s2t['throws'](
					function () { method([]); },
					TypeError,
					'throws on a normal array receiver'
				);

				s2t['throws'](
					function () { method(); },
					TypeError,
					'throws on no receiver'
				);

				s2t.end();
			});

			st.equal(method(new Uint8Array([])), '');
			st.equal(method(new Uint8Array([102])), '66');
			st.equal(method(new Uint8Array([102, 111])), '666f');
			st.equal(method(new Uint8Array([102, 111, 111])), '666f6f');
			st.equal(method(new Uint8Array([102, 111, 111, 98])), '666f6f62');
			st.equal(method(new Uint8Array([102, 111, 111, 98, 97])), '666f6f6261');
			st.equal(method(new Uint8Array([102, 111, 111, 98, 97, 114])), '666f6f626172');

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
			module.exports.tests(t, callBind(impl));

			t.end();
		});
	},
	shimmed: function () {
		test(shimName + ': shimmed', function (t) {
			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Uint8Array.prototype, methodName), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, callBind(Uint8Array.prototype[methodName]));

			t.end();
		});
	}
};
