'use strict';

var test = require('tape');
var forEach = require('es-abstract/helpers/forEach');

var shims = require('../');

forEach(shims, function (shim) {
	var shimTests;
	try {
		shimTests = require('./' + shim); // eslint-disable-line global-require
	} catch (e) {
		test(shim + ': index', { todo: true });
	}
	if (shimTests) {
		shimTests.index();
	}
});

