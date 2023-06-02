'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var callBound = require('call-bind/callBound');

var $arrayBufferResizable = callBound('%ArrayBuffer.prototype.resizable%', true);
var $sharedArrayGrowable = callBound('%SharedArrayBuffer.prototype.growable%', true);

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');

module.exports = function IsResizableArrayBuffer(arrayBuffer) {
	var isAB = isArrayBuffer(arrayBuffer);
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isAB && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or SharedArrayBuffer');
	}
	// 1. If arrayBuffer has an [[ArrayBufferMaxByteLength]] internal slot, return true.

	// 2. Return false.

	if (isAB) {
		try {
			return !!$arrayBufferResizable && $arrayBufferResizable(arrayBuffer); // step 1
		} catch (e) {
			return false; // step 2
		}
	}
	if (isSAB) {
		try {
			return !!$sharedArrayGrowable && $sharedArrayGrowable(arrayBuffer); // step 1
		} catch (e) {
			return false; // step 2
		}
	}
	return false; // step 2
};
