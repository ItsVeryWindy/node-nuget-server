function SQLiteDatabase(db) {
	this.db = db;
}

SQLiteDatabase.prototype = {
	connect: function(callback) {
		callback();
	},
	count: function(orderby, filter, searchTerm, callback) {
		
	},
	search: function(orderby, filter, searchTerm, skip, top, callback) {
		
	},
	update: function(packageInfo, stream, callback) {
		this.db.run('\
			INSERT OR REPLACE into packages (id, updated, downloadCount)\
			VALUES ($id, CURRENT_TIMESTAMP, COALESCE((SELECT downloadCount FROM packages WHERE id = $id), 0));', {
				$id: packageInfo.id,
				$downloadCount: packageInfo.downloadCount,
			});
		
		this.db.run('\
			INSERT OR REPLACE into packageVersions (\
				id, version, title,	summary, authors, copyright, created,\
				description, icon, language, published, packageHash,\
				packageAlgorithm, packageSize, projectUrl, releaseNotes,\
				requireLicenseAcceptance, tags, versionDownloadCount,\
				minClientCersion, lastEdited, licenseUrl)\
			VALUES (\
				$id, $version, $title, $summary, $authors, $copyright, CURRENT_TIMESTAMP,\
				$description, $icon, $language, CURRENT_TIMESTAMP, $packageHash,\
				$packageAlgorithm, $packageSize, $projectUrl, $releaseNotes,\
				$requireLicenseAcceptance, $tags, COALESCE((SELECT versionDownloadCount FROM packageVersions WHERE id = $id), 0),\
				$minClientCersion, (SELECT CURRENT_TIMESTAMP FROM packageVersions WHERE id = $id), $licenseUrl);'. {
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
				});
		
		console.log(packageInfo);
		callback();
	}
};

module.exports = SQLiteDatabase;