'use strict';

var defineProperties = require('define-properties');
var test = require('tape');
var callBind = require('call-bind');

var index = require('../Uint8Array.prototype.toBase64');
var impl = require('../Uint8Array.prototype.toBase64/implementation');

var polyfill = require('../Uint8Array.prototype.toBase64/polyfill')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var methodName = 'toBase64';
var shimName = 'Uint8Array.prototype.' + methodName;

module.exports = {
	tests: function (t, method) {
		t.test({ skip: typeof Uint8Array === 'function' }, 'Uint8Arrays not supported', function (st) {
			st['throws'](
				function () { return method(); },
				SyntaxError,
				'throws SyntaxError when Uint8Arrays are not supported'
			);

			st.end();
		});

		t.test({ skip: typeof Uint8Array !== 'function' }, 'Uint8Arrays supported', function (st) {
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
