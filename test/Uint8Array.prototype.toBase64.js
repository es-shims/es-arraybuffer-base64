'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var callBind = require('call-bind');
var defineProperties = require('define-properties');
var DetachArrayBuffer = require('es-abstract/2023/DetachArrayBuffer');
var forEach = require('es-abstract/helpers/forEach');
var isCore = require('is-core-module');
var test = require('tape');

/* globals postMessage: false */
var canDetach = typeof structuredClone === 'function' || typeof postMessage === 'function' || isCore('worker_threads');

var index = require('../Uint8Array.prototype.toBase64');
var impl = require('../Uint8Array.prototype.toBase64/implementation');

var polyfill = require('../Uint8Array.prototype.toBase64/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var methodName = 'toBase64';
var shimName = 'Uint8Array.prototype.' + methodName;

module.exports = {
	tests: function (t, method) {
		t.test('Uint8Arrays not supported', { skip: typeof Uint8Array === 'function' }, function (st) {
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
				'+/+/',
				'no alphabet produces base64 string'
			);

			st.equal(
				method(array, { alphabet: 'base64' }),
				'+/+/',
				'base64 alphabet produces base64 string'
			);

			st.equal(
				method(array, { alphabet: 'base64url' }),
				'-_-_',
				'base64url alphabet produces base64url string'
			);

			st['throws'](
				function () { return method(array, { alphabet: 'invalid' }); },
				TypeError,
				'invalid alphabet throws'
			);

			st.test('test262: test/built-ins/Uint8Array/prototype/toBase64/alphabet.js', function (s2t) {
				s2t.equal(method(new Uint8Array([199, 239, 242])), 'x+/y');

				s2t.equal(method(new Uint8Array([199, 239, 242]), { alphabet: 'base64' }), 'x+/y');

				s2t.equal(method(new Uint8Array([199, 239, 242]), { alphabet: 'base64url' }), 'x-_y');

				s2t['throws'](
					function () { method(new Uint8Array([199, 239, 242]), { alphabet: 'other' }); },
					TypeError
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/toBase64/receiver-not-uint8array.js', {
				skip: defineProperties.supportsDescriptors
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
					function () { method([], options); },
					TypeError
				);

				s2t['throws'](
					function () { method(options); },
					TypeError
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/toBase64/detached-buffer.js', {
				skip: !canDetach || !defineProperties.supportsDescriptors
			}, function (s2t) {
				var arr = new Uint8Array(2);
				var receiverDetachingOptions = {};
				var results = s2t.intercept(receiverDetachingOptions, 'alphabet', {
					get: function () {
						DetachArrayBuffer(arr.buffer);
						return 'base64';
					}
				});

				s2t['throws'](
					function () { method(arr, receiverDetachingOptions); },
					TypeError
				);
				s2t.deepEqual(results(), [
					{
						type: 'get',
						success: true,
						value: 'base64',
						args: [],
						receiver: receiverDetachingOptions
					}
				]);

				var detached = new Uint8Array(2);
				DetachArrayBuffer(detached.buffer);
				var sideEffectingOptions = {};
				var results2 = s2t.intercept(sideEffectingOptions, 'alphabet', {
					get: function () {
						return 'base64';
					}
				});

				s2t['throws'](
					function () { method(detached, sideEffectingOptions); },
					TypeError
				);
				s2t.deepEqual(results2(), [
					{
						type: 'get',
						success: true,
						value: 'base64',
						args: [],
						receiver: sideEffectingOptions
					}
				]);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/toBase64/option-coercion.js', function (s2t) {
				s2t['throws'](
					function () {
						method(new Uint8Array(2), { alphabet: Object('base64') });
					},
					TypeError
				);

				var throwyToString = {};
				var results = s2t.intercept(throwyToString, 'toString', {
					value: function () {
						throw new EvalError('toString called on alphabet value');
					}
				});
				s2t['throws'](
					function () { method(new Uint8Array(2), { alphabet: throwyToString }); },
					TypeError
				);
				s2t.deepEqual(results(), []);

				var base64UrlOptions = {};
				var results2 = s2t.intercept(base64UrlOptions, 'alphabet', {
					get: function () {
						return 'base64url';
					}
				});
				s2t.equal(method(new Uint8Array([199, 239, 242]), base64UrlOptions), 'x-_y');
				s2t.deepEqual(results2(), [
					{
						type: 'get',
						success: true,
						value: 'base64url',
						args: [],
						receiver: base64UrlOptions
					}
				]);

				// side-effects from the getter on the receiver are reflected in the result
				var arr = new Uint8Array([0]);
				var receiverMutatingOptions = {};
				var results3 = s2t.intercept(receiverMutatingOptions, 'alphabet', {
					get: function () {
						arr[0] = 255;
						return 'base64';
					}
				});
				var result = method(arr, receiverMutatingOptions);
				s2t.equal(result, '/w==');
				s2t.equal(arr[0], 255);
				s2t.deepEqual(results3(), [
					{
						type: 'get',
						success: true,
						value: 'base64',
						args: [],
						receiver: receiverMutatingOptions
					}
				]);

				s2t.end();
			});

			// standard test vectors from https://datatracker.ietf.org/doc/html/rfc4648#section-10
			st.equal(method(new Uint8Array([])), '');
			st.equal(method(new Uint8Array([102])), 'Zg==');
			st.equal(method(new Uint8Array([102, 111])), 'Zm8=');
			st.equal(method(new Uint8Array([102, 111, 111])), 'Zm9v');
			st.equal(method(new Uint8Array([102, 111, 111, 98])), 'Zm9vYg==');
			st.equal(method(new Uint8Array([102, 111, 111, 98, 97])), 'Zm9vYmE=');
			st.equal(method(new Uint8Array([102, 111, 111, 98, 97, 114])), 'Zm9vYmFy');

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
				et.equal(false, isEnumerable.call(Uint8Array.prototype, methodName), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, callBind(Uint8Array.prototype[methodName]));

			t.end();
		});
	}
};
