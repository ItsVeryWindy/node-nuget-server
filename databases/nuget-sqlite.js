function SQLiteDatabase(db) {
	this.db = db;
}

SQLiteDatabase.prototype = {
	connect: function(callback) {
		var db = this.db;
		
		db.serialize(function() {
			db.run('CREATE TABLE packages (id TEXT PRIMARY KEY, updated INTEGER, downloadCount INTEGER)', [], function(err) {
				if (err) {
					callback(err);
				}
			});
			
			db.run('CREATE TABLE packageVersions (\
			 		id TEXT, version TEXT, title TEXT, summary TEXT, authors TEXT, copyright TEXT, created INTEGER,\
			 		description TEXT, icon TEXT, language TEXT, published INTEGER, packageHash TEXT,\
			 		packageAlgorithm TEXT, packageSize INTEGER, projectUrl TEXT, releaseNotes TEXT,\
					requireLicenseAcceptance INTEGER, tags TEXT, versionDownloadCount INTEGER,\
			 		minClientVersion TEXT, lastEdited INTEGER, licenseUrl TEXT, PRIMARY KEY (id, version))', [], function(err) {
				if (err) {
					callback(err);
				}
			});
			
			db.run('CREATE TABLE packageVersionDependencies (id TEXT, version TEXT, dependencyId TEXT, dependencyVersion TEXT,\
				targetFramework TEXT, PRIMARY KEY (id, version, dependencyId, dependencyVersion, targetFramework))', [], function(err) {
				callback(err);
			});
		});
	},
	count: function (orderby, filter, searchTerm, callback) {
		
	},
	search: function (orderby, filter, searchTerm, skip, top, callback) {
		
	},
	update: function (packageInfo, stream, callback) {
		var db = this.db;
		
		db.serialize(function () {
			db.run('\
				INSERT OR REPLACE into packages (id, updated, downloadCount)\
				VALUES ($id, CURRENT_TIMESTAMP, COALESCE((SELECT downloadCount FROM packages WHERE id = $id), 0));', {
					$id: packageInfo.id
				}, function (err) {
					if (err) {
						callback(err);
					}
				});
			
			db.run('\
				INSERT OR REPLACE into packageVersions (\
					id, version, title,	summary, authors, copyright, created,\
					description, icon, language, published, packageHash,\
					packageAlgorithm, packageSize, projectUrl, releaseNotes,\
					requireLicenseAcceptance, tags, versionDownloadCount,\
					minClientVersion, lastEdited, licenseUrl)\
				VALUES (\
					$id, $version, $title, $summary, $authors, $copyright, CURRENT_TIMESTAMP,\
					$description, $icon, $language, CURRENT_TIMESTAMP, $packageHash,\
					$packageAlgorithm, $packageSize, $projectUrl, $releaseNotes,\
					$requireLicenseAcceptance, $tags, COALESCE((SELECT versionDownloadCount FROM packageVersions WHERE id = $id), 0),\
					$minClientVersion, (SELECT CURRENT_TIMESTAMP FROM packageVersions WHERE id = $id), $licenseUrl);', {
				$id: packageInfo.id,
				$version: packageInfo.version,
				$title: packageInfo.title,
				$summary: packageInfo.summary,
				$authors: packageInfo.authors.join(', '),
				$copyright: packageInfo.copyright,
				$description: packageInfo.description,
				$icon: packageInfo.icon,
				$language: packageInfo.language,
				$packageHash: packageInfo.packageHash,
				$packageAlgorithm: packageInfo.packageAlgorithm,
				$packageSize: packageInfo.packageSize,
				$projectUrl: packageInfo.projectUrl,
				$releaseNotes: packageInfo.releaseNotes,
				$requireLicenseAcceptance: packageInfo.requireLicenseAcceptance,
				$tags: packageInfo.tags.join(' '),
				$minClientVersion: packageInfo.minClientVersion,
				$licenseUrl: packageInfo.licenseUrl,
			}, function (err) {
				if (err) {
					callback(err);
				}
			});
				
			db.run('DELETE FROM packageVersionDependencies WHERE id = $id AND version = $version', {
				$id: packageInfo.id,
				$version: packageInfo.version
			}, function (err) {
				if (err) {
					callback(err);
				}
			});
			
			var stmt = db.prepare('\
				INSERT INTO packageVersionDependencies (id, version, dependencyId, dependencyVersion, targetFramework)\
				VALUES ($id, $version, $dependencyId, $dependencyVersion, $targetFramework);');
			
			packageInfo.dependencies.forEach(function (item) {	
				stmt.run({
					$id: packageInfo.id,
					$version: packageInfo.version,
					$dependencyId: item.id,
					$dependencyVersion: item.version,
					$targetFramework: item.targetFramework
				}, function (err) {
					if(err) {
						callback(err);
					}
				});
			});
			
			stmt.finalize(function (err) {
				callback(err);
			});
		});
	}
};

module.exports = SQLiteDatabase;