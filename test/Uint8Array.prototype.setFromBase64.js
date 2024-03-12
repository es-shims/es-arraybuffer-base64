'use strict';

var callBind = require('call-bind');
var defineProperties = require('define-properties');
var DetachArrayBuffer = require('es-abstract/2023/DetachArrayBuffer');
var forEach = require('es-abstract/helpers/forEach');
var isCore = require('is-core-module');
var test = require('tape');

/* globals postMessage: false */
var canDetach = typeof structuredClone === 'function' || typeof postMessage === 'function' || isCore('worker_threads');

var index = require('../Uint8Array.prototype.setFromBase64');
var impl = require('../Uint8Array.prototype.setFromBase64/implementation');

var polyfill = require('../Uint8Array.prototype.setFromBase64/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.prototype.setFromBase64';

module.exports = {
	tests: function (t, method) {
		t.test('Uint8Arrays not supported', { skip: typeof Uint8Array === 'function' }, function (st) {
			st['throws'](
				function () { return method(''); },
				SyntaxError,
				'throws SyntaxError when Uint8Arrays are not supported'
			);

			st.end();
		});

		t.test('Uint8Arrays supported', { skip: typeof Uint8Array !== 'function' }, function (st) {
			var arr = new Uint8Array(12);
			arr[0] = 1;

			st['throws'](
				function () { return method(arr, 'F'); },
				SyntaxError,
				'throws on odd-numbered length base64 strings'
			);

			var expectedArr = new Uint8Array(12);
			expectedArr[0] = 1;
			st.deepEqual(method(arr, ''), { read: 0, written: 0 }, 'empty string makes no changes');
			st.deepEqual(arr, expectedArr, '`arr`, no changes');

			var helloWorld = 'aGVsbG8gd29ybGQ=';
			var sentenceHelloWorld = 'SGVsbG8gV29ybGQ=';
			if (typeof atob === 'function') {
				st.equal(atob(helloWorld), 'hello world', 'hardcoded base64 string decodes correctly');
				st.equal(btoa('hello world'), helloWorld, 'hardcoded base64 string is encoded correctly');

				st.equal(atob(sentenceHelloWorld), 'Hello World', 'hardcoded base64 string, sentence case, decodes correctly');
				st.equal(btoa('Hello World'), sentenceHelloWorld, 'hardcoded base64 string, sentence case, is encoded correctly');
			}

			var expected = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0]);

			st.deepEqual(
				method(arr, helloWorld),
				{ read: 16, written: 11 },
				'return object is as expected'
			);
			st.deepEqual(
				arr,
				expected,
				'base64 produces expected bytes'
			);

			st.deepEqual(
				method(arr, sentenceHelloWorld),
				{ read: 16, written: 11 },
				'return object is as expected'
			);
			st.deepEqual(
				arr,
				new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 0]),
				'base64 produces expected bytes (from https://tc39.es/proposal-arraybuffer-base64/ examples)'
			);

			st.deepEqual(
				method(arr, '+/+/'),
				{ read: 4, written: 3 },
				'return object is as expected'
			);
			st.deepEqual(
				arr,
				new Uint8Array([251, 255, 191, 108, 111, 32, 87, 111, 114, 108, 100, 0]),
				'base64 string with no alphabet produces expected bytes'
			);

			st.deepEqual(
				method(arr, '+/+/', { alphabet: 'base64' }),
				{ read: 4, written: 3 },
				'return object is as expected'
			);
			st.deepEqual(
				arr,
				new Uint8Array([251, 255, 191, 108, 111, 32, 87, 111, 114, 108, 100, 0]),
				'base64 string with base64 alphabet produces expected bytes'
			);

			st.deepEqual(
				method(arr, '-_-_', { alphabet: 'base64url' }),
				{ read: 4, written: 3 },
				'return object is as expected'
			);
			st.deepEqual(
				arr,
				new Uint8Array([251, 255, 191, 108, 111, 32, 87, 111, 114, 108, 100, 0]),
				'base64url string with base64url alphabet produces expected bytes'
			);

			st['throws'](
				function () { method(arr, '-_-_', { alphabet: 'base64' }); },
				SyntaxError,
				'base64url string with base64 alphabet throws'
			);

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/alphabet.js', function (s2t) {
				var target1 = new Uint8Array([255, 255, 255, 255]);
				var result1 = method(target1, 'x+/y');
				s2t.deepEqual(result1, { read: 4, written: 3 });
				s2t.deepEqual(target1, new Uint8Array([199, 239, 242, 255]));

				var target2 = new Uint8Array([255, 255, 255, 255]);
				var result2 = method(target2, 'x+/y', { alphabet: 'base64' });
				s2t.deepEqual(result2, { read: 4, written: 3 });
				s2t.deepEqual(target2, new Uint8Array([199, 239, 242, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255]);
						method(target, 'x+/y', { alphabet: 'base64url' });
					},
					SyntaxError
				);

				var target3 = new Uint8Array([255, 255, 255, 255]);
				var result3 = method(target3, 'x-_y', { alphabet: 'base64url' });
				s2t.deepEqual(result3, { read: 4, written: 3 });
				s2t.deepEqual(target3, new Uint8Array([199, 239, 242, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255]);
						method(target, 'x-_y');
					},
					SyntaxError
				);
				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255]);
						method(target, 'x-_y', { alphabet: 'base64' });
					},
					SyntaxError
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/detached-buffer.js', { skip: !canDetach }, function (s2t) {
				var target = new Uint8Array([255, 255, 255]);
				DetachArrayBuffer(target.buffer);

				s2t['throws'](
					function () { method(target, 'Zg=='); },
					TypeError
				);

				var target2 = new Uint8Array([255, 255, 255]);

				var targetDetachingOptions = {};
				var results = s2t.intercept(targetDetachingOptions, 'alphabet', {
					get: function () {
						DetachArrayBuffer(target2.buffer);
						return 'base64';
					}
				});

				s2t['throws'](
					function () { method(target2, 'Zg==', targetDetachingOptions); },
					TypeError
				);
				s2t.deepEqual(
					results(),
					[
						{
							type: 'get',
							success: true,
							value: 'base64',
							args: [],
							receiver: { alphabet: 'base64' }
						}
					],
					'one call, as expected'
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/last-chunk-handling.js', function (s2t) {
				// padding
				var target1 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result1 = method(target1, 'ZXhhZg==');
				s2t.deepEqual(result1, { read: 8, written: 4 });
				s2t.deepEqual(target1, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target2 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result2 = method(target2, 'ZXhhZg==', { lastChunkHandling: 'loose' });
				s2t.deepEqual(result2, { read: 8, written: 4 });
				s2t.deepEqual(target2, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target3 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result3 = method(target3, 'ZXhhZg==', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result3, { read: 8, written: 4 });
				s2t.deepEqual(target3, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target4 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result4 = method(target4, 'ZXhhZg==', { lastChunkHandling: 'strict' });
				s2t.deepEqual(result4, { read: 8, written: 4 });
				s2t.deepEqual(target4, new Uint8Array([101, 120, 97, 102, 255, 255]));

				// no padding
				var target5 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result5 = method(target5, 'ZXhhZg');
				s2t.deepEqual(result5, { read: 6, written: 4 });
				s2t.deepEqual(target5, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target6 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result6 = method(target6, 'ZXhhZg', { lastChunkHandling: 'loose' });
				s2t.deepEqual(result6, { read: 6, written: 4 });
				s2t.deepEqual(target6, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target7 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result7 = method(target7, 'ZXhhZg', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result7, { read: 4, written: 3 });
				s2t.deepEqual(target7, new Uint8Array([101, 120, 97, 255, 255, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg', { lastChunkHandling: 'strict' });
					},
					SyntaxError
				);

				// non-zero padding bits
				var target8 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result8 = method(target8, 'ZXhhZh==');
				s2t.deepEqual(result8, { read: 8, written: 4 });
				s2t.deepEqual(target8, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target9 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result9 = method(target9, 'ZXhhZh==', { lastChunkHandling: 'loose' });
				s2t.deepEqual(result9, { read: 8, written: 4 });
				s2t.deepEqual(target9, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target10 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result10 = method(target10, 'ZXhhZh==', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result10, { read: 8, written: 4 });
				s2t.deepEqual(target10, new Uint8Array([101, 120, 97, 102, 255, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZh==', { lastChunkHandling: 'strict' });
					},
					SyntaxError
				);

				// non-zero padding bits, no padding
				var target11 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result11 = method(target11, 'ZXhhZh');
				s2t.deepEqual(result11, { read: 6, written: 4 });
				s2t.deepEqual(target11, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target12 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result12 = method(target12, 'ZXhhZh', { lastChunkHandling: 'loose' });
				s2t.deepEqual(result12, { read: 6, written: 4 });
				s2t.deepEqual(target12, new Uint8Array([101, 120, 97, 102, 255, 255]));

				var target13 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result13 = method(target13, 'ZXhhZh', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result13, { read: 4, written: 3 });
				s2t.deepEqual(target13, new Uint8Array([101, 120, 97, 255, 255, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZh', { lastChunkHandling: 'strict' });
					},
					SyntaxError
				);

				// partial padding
				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg=');
					},
					SyntaxError
				);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg=', { lastChunkHandling: 'loose' });
					},
					SyntaxError
				);

				var target14 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result = method(target14, 'ZXhhZg=', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result, { read: 4, written: 3 });
				s2t.deepEqual(target14, new Uint8Array([101, 120, 97, 255, 255, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg=', { lastChunkHandling: 'strict' });
					},
					SyntaxError
				);

				// excess padding
				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg===');
					},
					SyntaxError
				);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg===', { lastChunkHandling: 'loose' });
					},
					SyntaxError
				);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg===', { lastChunkHandling: 'stop-before-partial' });
					},
					SyntaxError
				);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg===', { lastChunkHandling: 'strict' });
					},
					SyntaxError
				);

				// malformed padding
				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg=');
					},
					SyntaxError
				);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg=', { lastChunkHandling: 'loose' });
					},
					SyntaxError
				);

				var target15 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result15 = method(target15, 'ZXhhZg=', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result15, { read: 4, written: 3 });
				s2t.deepEqual(target15, new Uint8Array([101, 120, 97, 255, 255, 255]));

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255, 255, 255, 255]);
						method(target, 'ZXhhZg=', { lastChunkHandling: 'strict' });
					},
					SyntaxError
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/option-coercion.js', function (s2t) {
				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255]);
						method(target, 'Zg==', { alphabet: Object('base64') });
					},
					TypeError
				);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255]);
						method(target, 'Zg==', { lastChunkHandling: Object('strict') });
					},
					TypeError
				);

				var throwyToString = {};
				var results = s2t.intercept(throwyToString, 'toString', {
					value: function () {
						throw new EvalError('toString called');
					}
				});
				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255]);
						method(target, 'Zg==', { alphabet: throwyToString });
					},
					TypeError
				);
				s2t.deepEqual(results(), []);

				s2t['throws'](
					function () {
						var target = new Uint8Array([255, 255, 255]);
						method(target, 'Zg==', { lastChunkHandling: throwyToString });
					},
					TypeError
				);
				s2t.deepEqual(results(), []);

				var alphabetAccesses = 0;
				var base64UrlOptions = {};
				Object.defineProperty(base64UrlOptions, 'alphabet', {
					get: function () {
						alphabetAccesses += 1;
						return 'base64url';
					}
				});
				var target = new Uint8Array([255, 255, 255, 255]);
				var result = method(target, 'x-_y', base64UrlOptions);
				s2t.deepEqual(result, { read: 4, written: 3 });
				s2t.deepEqual(target, new Uint8Array([199, 239, 242, 255]));
				s2t.equal(alphabetAccesses, 1);

				var lastChunkHandlingAccesses = 0;
				var strictOptions = {};
				Object.defineProperty(strictOptions, 'lastChunkHandling', {
					get: function () {
						lastChunkHandlingAccesses += 1;
						return 'strict';
					}
				});
				var target2 = new Uint8Array([255, 255, 255, 255]);
				var result2 = method(target2, 'Zg==', strictOptions);
				s2t.deepEqual(result2, { read: 4, written: 1 });
				s2t.deepEqual(target2, new Uint8Array([102, 255, 255, 255]));
				s2t.equal(lastChunkHandlingAccesses, 1);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/string-coercion.js', function (s2t) {
				var throwyToString = {};
				var toStringResults = s2t.intercept(throwyToString, 'toString', {
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
				s2t.deepEqual(toStringResults(), []);

				s2t.test('getters', { skip: !defineProperties.supportsDescriptors }, function (s3t) {
					var touchyOptions = {};
					var alphaResults = s3t.intercept(
						touchyOptions,
						'alphabet',
						{ get: function () { throw new EvalError('alphabet accessed'); } }
					);
					var lastChunkResults = s3t.intercept(
						touchyOptions,
						'lastChunkHandling',
						{ get: function () { throw new EvalError('alphabet accessed'); } }
					);

					s3t['throws'](
						function () {
							var target = new Uint8Array(10);
							method(target, throwyToString, touchyOptions);
						},
						TypeError
					);
					s3t.deepEqual(toStringResults(), []);
					s3t.deepEqual(alphaResults(), []);
					s3t.deepEqual(lastChunkResults(), []);

					s3t.end();
				});

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/subarray.js', function (s2t) {
				var base = new Uint8Array([255, 255, 255, 255, 255, 255, 255]);
				var subarray = base.subarray(2, 5);

				var result = method(subarray, 'Zm9vYmFy');
				s2t.deepEqual(result, { read: 4, written: 3 });
				s2t.deepEqual(subarray, new Uint8Array([102, 111, 111]));
				s2t.deepEqual(base, new Uint8Array([255, 255, 102, 111, 111, 255, 255]));

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/prototype/setFromBase64/target-size.js', function (s2t) {
				// buffer too small
				var target1 = new Uint8Array([255, 255, 255, 255, 255]);
				var result1 = method(target1, 'Zm9vYmFy');
				s2t.deepEqual(result1, { read: 4, written: 3 });
				s2t.deepEqual(target1, new Uint8Array([102, 111, 111, 255, 255]));

				// buffer too small, padded
				var target2 = new Uint8Array([255, 255, 255, 255]);
				var result2 = method(target2, 'Zm9vYmE=');
				s2t.deepEqual(result2, { read: 4, written: 3 });
				s2t.deepEqual(target2, new Uint8Array([102, 111, 111, 255]));

				// buffer exact
				var target3 = new Uint8Array([255, 255, 255, 255, 255, 255]);
				var result3 = method(target3, 'Zm9vYmFy');
				s2t.deepEqual(result3, { read: 8, written: 6 });
				s2t.deepEqual(target3, new Uint8Array([102, 111, 111, 98, 97, 114]));

				// buffer exact, padded
				var target4 = new Uint8Array([255, 255, 255, 255, 255]);
				var result4 = method(target4, 'Zm9vYmE=');
				s2t.deepEqual(result4, { read: 8, written: 5 });
				s2t.deepEqual(target4, new Uint8Array([102, 111, 111, 98, 97]));

				// buffer exact, not padded
				var target5 = new Uint8Array([255, 255, 255, 255, 255]);
				var result5 = method(target5, 'Zm9vYmE');
				s2t.deepEqual(result5, { read: 7, written: 5 });
				s2t.deepEqual(target5, new Uint8Array([102, 111, 111, 98, 97]));

				// buffer exact, padded, stop-before-partial
				var target6 = new Uint8Array([255, 255, 255, 255, 255]);
				var result6 = method(target6, 'Zm9vYmE=', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result6, { read: 8, written: 5 });
				s2t.deepEqual(target6, new Uint8Array([102, 111, 111, 98, 97]));

				// buffer exact, not padded, stop-before-partial
				var target7 = new Uint8Array([255, 255, 255, 255, 255]);
				var result7 = method(target7, 'Zm9vYmE', { lastChunkHandling: 'stop-before-partial' });
				s2t.deepEqual(result7, { read: 4, written: 3 });
				s2t.deepEqual(target7, new Uint8Array([102, 111, 111, 255, 255]));

				// buffer too large
				var target8 = new Uint8Array([255, 255, 255, 255, 255, 255, 255]);
				var result8 = method(target8, 'Zm9vYmFy');
				s2t.deepEqual(result8, { read: 8, written: 6 });
				s2t.deepEqual(target8, new Uint8Array([102, 111, 111, 98, 97, 114, 255]));

				s2t.end();
			});

			var illegal = [
				'Zm.9v',
				'Zm9v^',
				'Zg==&',
				'Z\u2212==', // U+2212 'Minus Sign'
				'Z\uFF0B==', // U+FF0B 'Fullwidth Plus Sign'
				'Zg\u00A0==', // nbsp
				'Zg\u2009==', // thin space
				'Zg\u2028==' // line separator
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

			var standardBase64Vectors = [
				['', []],
				['Zg==', [102]],
				['Zm8=', [102, 111]],
				['Zm9v', [102, 111, 111]],
				['Zm9vYg==', [102, 111, 111, 98]],
				['Zm9vYmE=', [102, 111, 111, 98, 97]],
				['Zm9vYmFy', [102, 111, 111, 98, 97, 114]]
			];
			forEach(standardBase64Vectors, function (pair) {
				var allFF = [255, 255, 255, 255, 255, 255, 255, 255];
				var target = new Uint8Array(allFF);
				var result = method(target, pair[0]);
				st.deepEqual(result, { read: pair[0].length, written: pair[1].length });

				var expectedResult = new Uint8Array(pair[1].concat(allFF.slice(pair[1].length)));
				st.deepEqual(target, expectedResult, 'decoding ' + pair[0]);
			});

			var whitespaceKinds = [
				['Z g==', 'space'],
				['Z\tg==', 'tab'],
				['Z\x0Ag==', 'LF'],
				['Z\x0Cg==', 'FF'],
				['Z\x0Dg==', 'CR']
			];
			forEach(whitespaceKinds, function (pair) {
				var target = new Uint8Array([255, 255, 255]);
				var result = method(target, pair[0]);
				st.deepEqual(result, { read: 5, written: 1 });
				st.deepEqual(target, new Uint8Array([102, 255, 255]), 'ascii whitespace: ' + pair[1]);
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
				et.equal(false, isEnumerable.call(Uint8Array.prototype, 'setFromBase64'), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, callBind(Uint8Array.prototype.setFromBase64));

			t.end();
		});
	}
};
