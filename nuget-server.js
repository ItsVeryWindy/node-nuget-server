var fs = require('fs');

function NugetServer(db, apiKey) {
	this.db = db;
  this.apiKey = apiKey;
}

NugetServer.prototype = {
	index: function (url, callback) {
		var content = '\
<?xml version="1.0" encoding="utf-8" standalone="yes"?>\
<service xml:base="' + url + '" \
xmlns:atom="http://www.w3.org/2005/Atom" \
xmlns:app="http://www.w3.org/2007/app" \
xmlns="http://www.w3.org/2007/app"> \
<workspace>\
<atom:title>Default</atom:title>\
<collection href="Packages">\
<atom:title>Packages</atom:title>\
</collection>\
</workspace>\
</service>';
		callback(content);
	},
	download: function (id, version, success, failure) {
		var stream = fs.createReadStream('jquery.1.8.1.nupkg');
		
		success(stream);
	},
	push: function (apiKey, package, success, failure) {
        //var name = package.hapi.filename;
        //var path = __dirname + "/uploads/" + name;
        var file = fs.createWriteStream("test.png");

        file.on('error', function (err) { 
            failure(err) 
        });

        package.pipe(file);

        package.on('end', function (err) {
			if(err) return failure(err);
            
			success();
        });
  	},
	search: function (includePrerelease, orderby, filter, searchTerm, skip, top, callback) {
		callback([self, jQuery]);
	},
	findPackagesById: function (id, callback) {
		callback([jQuery]);
	},
	count: function (includePrerelease, orderby, filter, searchTerm, callback) {
		callback(1);
	},
	metadata: function(callback) {
		var stream = fs.createReadStream('metadata.xml');
		
		callback(stream);
	}
};

var self = {
	id: 'myid',
	version: '1.0',
	title: 'mytitle',
	summary: 'mysummary',
	authors: ['hello'],
	copyright: '',
	updated: new Date(),
	created: new Date(),
	description: 'mydescription',
	dependencies: [{
		id: 'jQuery',
		version: '1.8.1'
	}],
	downloadCount: 0,
	icon: '',
	isLatest: true,
	isAbsoluteLatest: true,
	isPrerelease: false,
	language: 'mylanguage',
	published: new Date(),
	packageHash: '',
	packageHashAlgorithm: '',
	packageSize: 0,
	projectUrl: '',
	releaseNotes: '',
	requireLicenseAcceptance: false,
	tags: ['hello'],
	versionDownloadCount: 0,
	minClientVersion: '',
	lastEdited: null,
	licenseUrl: null
};

var jQuery = {
	id: 'jQuery',
	version: '1.8.1',
	title: 'jQuery',
	summary: 'mysummary',
	authors: ['hello'],
	copyright: '',
	updated: new Date(),
	created: new Date(),
	description: 'mydescription',
	dependencies: [],
	downloadCount: 0,
	icon: '',
	isLatest: true,
	isAbsoluteLatest: true,
	isPrerelease: false,
	language: 'mylanguage',
	published: new Date(),
	packageHash: '',
	packageHashAlgorithm: '',
	packageSize: 0,
	projectUrl: '',
	releaseNotes: '',
	requireLicenseAcceptance: false,
	tags: ['hello'],
	versionDownloadCount: 0,
	minClientVersion: '',
	lastEdited: null,
	licenseUrl: null
};

module.exports = NugetServer;