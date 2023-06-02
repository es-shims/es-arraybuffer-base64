'use strict';

var defineProperties = require('define-properties');
var test = require('tape');

var index = require('../Uint8Array.fromBase64');
var impl = require('../Uint8Array.fromBase64/implementation');

var polyfill = require('../Uint8Array.fromBase64/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var shimName = 'Uint8Array.fromBase64';

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
				et.equal(false, isEnumerable.call(Uint8Array, 'fromBase64'), shimName + ' is not enumerable');
				et.end();
			});

			module.exports.tests(t, Uint8Array.fromBase64);

			t.end();
		});
	}
};
