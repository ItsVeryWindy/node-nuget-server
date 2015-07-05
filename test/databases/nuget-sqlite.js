/// <reference path="../../typings/sinon/sinon.d.ts"/>
/// <reference path="../../typings/mocha/mocha.d.ts"/>
var NugetRepository = require('../../databases/nuget-sqlite');
var sinon = require('sinon');
var should = require('should');

describe('connect', function() {
	var unitUnderTest, db;
	
	beforeEach(function() {
		db = sinon.spy();
		unitUnderTest = new NugetRepository(db);
	});
	
	it('should just call the callback with no errors', function(done) {
		unitUnderTest.connect(function(err) {
			should(err).be.empty;
			done();
		});
	});
});

describe('update', function() {
	var unitUnderTest, db;
	
	beforeEach(function() {
		db = sinon.spy();
		unitUnderTest = new NugetRepository(db);
	});
	
	it('should update the database with the package supplied', function(done) {
		var packageInfo = {};
		var stream = sinon.spy();
		
		unitUnderTest.update(packageInfo, stream, function(err) {
			should(err).be.empty;
			done();
		});
	});
});

