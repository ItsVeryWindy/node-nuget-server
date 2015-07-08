/// <reference path="../../typings/sinon/sinon.d.ts"/>
/// <reference path="../../typings/mocha/mocha.d.ts"/>
var NugetRepository = require('../../databases/nuget-sqlite');
var should = require('should');
var sqlite3 = require('sqlite3').verbose();

describe('connect', function() {
	var unitUnderTest, db;
	
	beforeEach(function() {
		db = new sqlite3.Database(':memory:');
		unitUnderTest = new NugetRepository(db);
	});
	
	it('should just call the callback with no errors', function(done) {
		unitUnderTest.connect(function(err) {
			should.not.exist(err);
			done();
		});
	});
});

describe('update', function() {
	var unitUnderTest, db;
	
	beforeEach(function(done) {
		db = new sqlite3.Database(':memory:');
		unitUnderTest = new NugetRepository(db);
		
		unitUnderTest.connect(function() {
			done();
		})
	});
	
	it('should update the database with the package supplied', function(done) {
		var packageInfo = buildPackage();
		var stream = null;
		
		unitUnderTest.update(packageInfo, stream, function(err) {
			should.not.exist(err);
			done();
		});
	});
});

describe('count', function() {
	var unitUnderTest, db;
	
	beforeEach(function(done) {
		db = new sqlite3.Database(':memory:');
		unitUnderTest = new NugetRepository(db);
		
		unitUnderTest.connect(function() {
			done();
		})
	});
	
	it('should count the number of packages', function(done) {
		var filter = {};
		var orderby = {};
		var searchTerm = '';
		
		unitUnderTest.count(orderby, filter, searchTerm, function(err, count) {
			should.not.exist(err);
			count.should.be.eql(1);
			done();
		});
	});
});

function buildPackage () {
	return {
		id: 'id',
		version: '1.0',
		title: 'title',
		summary: 'summary',
		authors: ['author'],
		copyright: 'copyright',
		description: 'description',
		icon: 'icon',
		language: 'language',
		packageHash: 'packageHash',
		packageAlgorithm: 'packageAlgorithm',
		packageSize: 0,
		projectUrl: 'projectUrl',
		releaseNotes: 'releaseNotes',
		requireLicenseAcceptance: false,
		tags: ['tag'],
		minClientVersion: '2.5',
		licenseUrl: 'licenseUrl',
		dependencies: [
			{ id: 'wat', version: '2.0', targetFramework: '4.5' }
		]
	};
}