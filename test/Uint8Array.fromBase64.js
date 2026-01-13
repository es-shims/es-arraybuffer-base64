'use strict';

var defineProperties = require('define-properties');
var forEach = require('es-abstract/helpers/forEach');
var getProto = require('get-proto');
var inspect = require('object-inspect');
var test = require('tape');

var index = require('../Uint8Array.fromBase64');
var impl = require('../Uint8Array.fromBase64/implementation');

var polyfill = require('../Uint8Array.fromBase64/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.fromBase64';

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
				'throws on odd-numbered length base64 strings'
			);

			st.deepEqual(method(''), new Uint8Array([]), 'empty string produces empty array');

			var helloWorld = 'aGVsbG8gd29ybGQ=';
			var sentenceHelloWorld = 'SGVsbG8gV29ybGQ=';
			if (typeof atob === 'function') {
				st.equal(atob(helloWorld), 'hello world', 'hardcoded base64 string decodes correctly');
				st.equal(btoa('hello world'), helloWorld, 'hardcoded base64 string is encoded correctly');

				st.equal(atob(sentenceHelloWorld), 'Hello World', 'hardcoded base64 string, sentence case, decodes correctly');
				st.equal(btoa('Hello World'), sentenceHelloWorld, 'hardcoded base64 string, sentence case, is encoded correctly');
			}

			var expected = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);

			st.deepEqual(
				method(helloWorld),
				expected,
				'base64 produces expected bytes'
			);

			st.deepEqual(
				method(sentenceHelloWorld),
				new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]),
				'base64 produces expected bytes (from https://tc39.es/proposal-arraybuffer-base64/ examples)'
			);

			st.deepEqual(
				method('+/+/'),
				new Uint8Array([251, 255, 191]),
				'base64 string with no alphabet produces expected bytes'
			);
			st.deepEqual(
				method('+/+/', { alphabet: 'base64' }),
				new Uint8Array([251, 255, 191]),
				'base64 string with base64 alphabet produces expected bytes'
			);
			st.deepEqual(
				method('-_-_', { alphabet: 'base64url' }),
				new Uint8Array([251, 255, 191]),
				'base64url string with base64url alphabet produces expected bytes'
			);
			st['throws'](
				function () { method('-_-_', { alphabet: 'base64' }); },
				SyntaxError,
				'base64url string with base64 alphabet throws'
			);

			st.test('test262: test/built-ins/Uint8Array/fromBase64/alphabet.js', function (s2t) {
				s2t.deepEqual(method('x+/y'), new Uint8Array([199, 239, 242]));
				s2t.deepEqual(method('x+/y', { alphabet: 'base64' }), new Uint8Array([199, 239, 242]));
				s2t['throws'](
					function () {
						method('x+/y', { alphabet: 'base64url' });
					},
					SyntaxError
				);

				s2t.deepEqual(method('x-_y', { alphabet: 'base64url' }), new Uint8Array([199, 239, 242]));
				s2t['throws'](
					function () { method('x-_y'); },
					SyntaxError
				);
				s2t['throws'](
					function () { method('x-_y', { alphabet: 'base64' }); },
					SyntaxError
				);

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
					function () { method(value); },
					SyntaxError,
					inspect(value) + ' throws SyntaxError'
				);
			});

			st.test('test262: test/built-ins/Uint8Array/fromBase64/last-chunk-handling.js', function (s2t) {
				// padding
				s2t.deepEqual(method('ZXhhZg=='), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZg==', { lastChunkHandling: 'loose' }), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZg==', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZg==', { lastChunkHandling: 'strict' }), new Uint8Array([101, 120, 97, 102]));

				// no padding
				s2t.deepEqual(method('ZXhhZg'), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZg', { lastChunkHandling: 'loose' }), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZg', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([101, 120, 97]));
				s2t['throws'](
					function () { method('ZXhhZg', { lastChunkHandling: 'strict' }); },
					SyntaxError
				);

				// non-zero padding bits
				s2t.deepEqual(method('ZXhhZh=='), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZh==', { lastChunkHandling: 'loose' }), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZh==', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([101, 120, 97, 102]));
				s2t['throws'](
					function () { method('ZXhhZh==', { lastChunkHandling: 'strict' }); },
					SyntaxError
				);

				// non-zero padding bits, no padding
				s2t.deepEqual(method('ZXhhZh'), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZh', { lastChunkHandling: 'loose' }), new Uint8Array([101, 120, 97, 102]));
				s2t.deepEqual(method('ZXhhZh', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([101, 120, 97]));
				s2t['throws'](
					function () { method('ZXhhZh', { lastChunkHandling: 'strict' }); },
					SyntaxError
				);

				// malformed padding
				s2t['throws'](
					function () { method('ZXhhZg='); },
					SyntaxError
				);
				s2t['throws'](
					function () { method('ZXhhZg=', { lastChunkHandling: 'loose' }); },
					SyntaxError
				);
				s2t.deepEqual(method('ZXhhZg=', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([101, 120, 97]));
				s2t['throws'](
					function () { method('ZXhhZg=', { lastChunkHandling: 'strict' }); },
					SyntaxError
				);

				// partial padding
				s2t['throws'](
					function () { method('ZXhhZg='); },
					SyntaxError
				);
				s2t['throws'](
					function () { method('ZXhhZg=', { lastChunkHandling: 'loose' }); },
					SyntaxError
				);
				s2t.deepEqual(method('ZXhhZg=', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([101, 120, 97]));
				s2t['throws'](
					function () { method('ZXhhZg=', { lastChunkHandling: 'strict' }); },
					SyntaxError
				);

				// excess padding
				s2t['throws'](
					function () { method('ZXhhZg==='); },
					SyntaxError
				);
				s2t['throws'](
					function () { method('ZXhhZg===', { lastChunkHandling: 'loose' }); },
					SyntaxError
				);
				s2t['throws'](
					function () { method('ZXhhZg===', { lastChunkHandling: 'stop-before-partial' }); },
					SyntaxError
				);
				s2t['throws'](
					function () { method('ZXhhZg===', { lastChunkHandling: 'strict' }); },
					SyntaxError
				);

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/fromBase64/option-coercion.js', function (s2t) {
				var throwyToString = {};
				var results = s2t.intercept(
					throwyToString,
					'toString',
					{ value: function () { throw new EvalError('toString called'); } }
				);

				s2t['throws'](
					function () { method('Zg==', { alphabet: throwyToString }); },
					TypeError
				);
				s2t.deepEqual(results(), []);

				s2t['throws'](
					function () { method('Zg==', { lastChunkHandling: throwyToString }); },
					TypeError
				);
				s2t.deepEqual(results(), []);

				s2t['throws'](
					function () { method('Zg==', { alphabet: Object('base64') }); },
					TypeError
				);

				s2t['throws'](
					function () { method('Zg==', { lastChunkHandling: Object('loose') }); },
					TypeError
				);

				s2t.test('getters', { skip: !defineProperties.supportsDescriptors }, function (s3t) {
					var base64UrlOptions = {};
					var alphabetResults = s3t.intercept(base64UrlOptions, 'alphabet', { get: function () { return 'base64url'; } });

					var arr = method('x-_y', base64UrlOptions);
					s3t.deepEqual(arr, new Uint8Array([199, 239, 242]));
					s3t.deepEqual(alphabetResults(), [
						{
							type: 'get',
							success: true,
							value: 'base64url',
							args: [],
							receiver: base64UrlOptions
						}
					]);

					var strictOptions = {};
					var strictResults = s3t.intercept(strictOptions, 'lastChunkHandling', { get: function () { return 'strict'; } });

					var arr2 = method('Zg==', strictOptions);
					s3t.deepEqual(arr2, new Uint8Array([102]));
					s3t.deepEqual(strictResults(), [
						{
							type: 'get',
							success: true,
							value: 'strict',
							args: [],
							receiver: strictOptions
						}
					]);

					s3t.end();
				});

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/fromBase64/results.js', function (s2t) {
				// standard test vectors from https://datatracker.ietf.org/doc/html/rfc4648#section-10
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
					var arr = method(pair[0]);
					s2t.equal(getProto(arr), Uint8Array.prototype, 'decoding ' + pair[0]);
					s2t.equal(arr.buffer.byteLength, pair[1].length, 'decoding ' + pair[0]);
					s2t.deepEqual(arr, new Uint8Array(pair[1]), 'decoding ' + pair[0]);
				});

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/fromBase64/string-coercion.js', function (s2t) {
				var throwyToString = {};
				var toStringResults = s2t.intercept(
					throwyToString,
					'toString',
					{ value: function () { throw new EvalError('toString called'); } }
				);

				s2t['throws'](
					function () { method(throwyToString); },
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
						function () { method(throwyToString, touchyOptions); },
						TypeError
					);
					s3t.deepEqual(toStringResults(), []);
					s3t.deepEqual(alphaResults(), []);
					s3t.deepEqual(lastChunkResults(), []);

					s3t.end();
				});

				s2t.end();
			});

			st.test('test262: test/built-ins/Uint8Array/fromBase64/whitespace.js', function (s2t) {
				var whitespaceKinds = [
					['Z g==', 'space'],
					['Z\tg==', 'tab'],
					['Z\x0Ag==', 'LF'],
					['Z\x0Cg==', 'FF'],
					['Z\x0Dg==', 'CR']
				];
				forEach(whitespaceKinds, function (pair) {
					var arr = method(pair[0]);

					s2t.equal(arr.length, 1);
					s2t.equal(arr.buffer.byteLength, 1);
					s2t.deepEqual(arr, new Uint8Array([102]), 'ascii whitespace: ' + pair[1]);
				});

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
			module.exports.tests(t, impl);

			t.end();
		});
	},
	shimmed: function () {
		test(shimName + ': shimmed', function (t) {
			t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
				et.equal(false, isEnumerable.call(Uint8Array, 'fromBase64'), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, Uint8Array.fromBase64);

			t.end();
		});
	}
};
