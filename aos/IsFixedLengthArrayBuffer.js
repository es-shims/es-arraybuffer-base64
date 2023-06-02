'use strict';

// var GetIntrinsic = require('get-intrinsic');

// var $TypeError = GetIntrinsic('%TypeError%');

var IsResizableArrayBuffer = require('./IsResizableArrayBuffer');

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');

// https://tc39.es/ecma262/#sec-isfixedlengtharraybuffer

module.exports = function IsFixedLengthArrayBuffer(arrayBuffer) {
	if (!isArrayBuffer(arrayBuffer) && !isSharedArrayBuffer(arrayBuffer)) {
		// checked inside IsResizableArrayBuffer
		// throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or a SharedArrayBuffer');
	}

	return !IsResizableArrayBuffer(arrayBuffer);
};
