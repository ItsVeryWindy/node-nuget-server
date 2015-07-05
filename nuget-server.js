var fs = require('fs');
var tmp = require('tmp');
var unzip = require('unzip');
var XmlStream = require('xml-stream');

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
	push: function (apiKey, package, callback) {
        var db = this.db;
		
		tmp.file(function(err, path, fd, cleanupCallback) {
			if(err) return callback(err);
			
			var packageFound = false;
			var packageParsed = false;
			var fileSaved = false;
			var packageInfo = {};
			
			var finish = function(err) {
				if(err) {
					cleanupCallback();
					callback(err);
					return;
				}
				
				if(!packageParsed || !fileSaved) {
					return;
				}
				
				db.update(packageInfo, fs.createReadStream(path), function(err) {
					cleanupCallback();
					callback(err);	  
			  	});
			};
			
			var file = fs.createWriteStream(path)
			
			package.pipe(file)
				.on('close', function (err) { 
		            fileSaved = !err;
					finish(err);
		        });
				
			package.pipe(unzip.Parse())
				.on('entry', function (entry) {
				    var fileName = entry.path;

				    if (fileName.indexOf('.nuspec', fileName.length - '.nuspec'.length) >= 0) {
						packageFound = true;
						
						entry.on('end', function(err) {
							if(!packageParsed) {
								finish('Package element not found');
							}
						});
						
						var xml = new XmlStream(entry)
						var group = null;
						
						xml.on('endElement: package > metadata > id', function(item) {
  						 	packageInfo.id = item.$text;
						});
						
						xml.on('endElement: package > metadata > version', function(item) {
  							packageInfo.version = item.$text;
						});
						
						xml.on('endElement: package > metadata > title', function(item) {
  							packageInfo.title = item.$text;
						});
						
						xml.on('endElement: package > metadata > authors', function(item) {
  							packageInfo.authors = item.$text.split(',').map(function(item) { return item.trim(); });
						});
						
						xml.on('endElement: package > metadata > owners', function(item) {
  							packageInfo.owners = item.$text.split(',').map(function(item) { return item.trim(); });
						});
			
						xml.on('endElement: package > metadata > description', function(item) {
  							packageInfo.description = item.$text;
						});
			
						xml.on('endElement: package > metadata > releaseNotes', function(item) {
  							packageInfo.releaseNotes = item.$text;
						});
						
						xml.on('endElement: package > metadata > summary', function(item) {
  							packageInfo.summary = item.$text;
						});
						
						xml.on('endElement: package > metadata > language', function(item) {
  							packageInfo.language = item.$text;
						});
						
						xml.on('endElement: package > metadata > projectUrl', function(item) {
  							packageInfo.projectUrl = item.$text;
						});
						
						xml.on('endElement: package > metadata > iconUrl', function(item) {
  							packageInfo.iconUrl = item.$text;
						});
						
						xml.on('endElement: package > metadata > requireLicenseAcceptance', function(item) {
  							packageInfo.requireLicenseAcceptance = item.$text;
						});
						
						xml.on('endElement: package > metadata > copyright', function(item) {
  							packageInfo.copyright = item.$text;
						});
						
						xml.on('startElement: package > metadata > dependencies', function(item) {
  							packageInfo.dependencies = [];
							packageInfo.dependencyGroups = [];
						});
						
						xml.on('endElement: package > metadata > dependencies > dependency', function(item) {
  							packageInfo.dependencies.push({ id: item.$.id, version: item.$.version });
						});
						
						xml.on('startElement: package > metadata > dependencies > group', function(item) {
							group = {
								targetFramework: item.$.targetFramework,
								dependencies: []
							}
						});
						
						xml.on('endElement: package > metadata > dependencies > group > dependency', function(item) {
  							group.dependencies.push({ id: item.$.id, version: item.$.version });
						});
						
						xml.on('endElement: package > metadata > dependencies > group', function(item) {
  							packageInfo.dependencyGroups.push(group);
						});
						
						xml.on('startElement: package > metadata > references', function(item) {
  							packageInfo.references = [];
							packageInfo.referenceGroups = [];
						});
						
						xml.on('endElement: package > metadata > references > reference', function(item) {
  							packageInfo.references.push(item.$.file);
						});
						
						xml.on('startElement: package > metadata > references > group', function(item) {
							group = {
								targetFramework: item.$.targetFramework,
								references: []
							}
						});
						
						xml.on('endElement: package > metadata > references > group > reference', function(item) {
  							group.references.push(item.$.file);
						});
						
						xml.on('endElement: package > metadata > references > group', function(item) {
  							packageInfo.referenceGroups.push(group);
						});
						
						xml.on('endElement: package > metadata > tags', function(item) {
  							packageInfo.tags = item.$text.split(' ').map(function(item) { return item.trim(); });
						});

						xml.on('endElement: package', function(item) {
  							packageParsed = true;
						  	finish();
						});
				    } else {
				      entry.autodrain();
				    }
				})
				.on('close', function(err) {
					if(!packageFound) {
						finish('Nuspec file not found');
					}	
				});
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