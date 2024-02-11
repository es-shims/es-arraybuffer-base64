'use strict';

var defineProperties = require('define-properties');
var test = require('tape');
var callBind = require('call-bind');

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
