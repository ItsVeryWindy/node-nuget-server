var xmlescape = require('xml-escape');

function atomParser(url, title, results) {
	var content = '\
<?xml version="1.0" encoding="utf-8"?>\
<feed \
xml:base="' + xmlescape(url) + '/" \
xmlns="http://www.w3.org/2005/Atom" \
xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" \
xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">' +
formatText('id', url + '/' + title) +
formatText('title', title, { type: 'text' }) +
formatDate('updated', new Date()) +
formatText('link', null, {
	rel: 'self',
	title: title,
	href: title
});
    
	results.forEach(function(result) {
		content += parseResult(url, result);
  	});
	  
  	content += '</feed>';
	  
	  return content;
}

function parseResult(url, result) {
	var id = formatId(result);
	
      return '\
<entry>' + 
formatText('id', url + '/' + id) +

formatText('category', null, {
	term: 'NuGetGallery.V2FeedPackage',
	scheme: 'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme'
}) +

formatText('link', null, {
	rel: 'edit',
	title: 'V2FeedPackage',
	href: id
}) +

formatText('title', result.title) +
formatText('id', result.summary) +
formatDate('updated', result.updated) + '\
<author>' +
formatText('name', result.authors.join(', ')) + '\
</author>' +

formatText('link', null, {
	rel: 'edit-media',
	title: 'V2FeedPackage',
	href: id + '/$value'
}) +

formatText('content', null, {
	type: 'application/zip',
	src: url + '/package/' + result.id + '/' + result.version,
}) + '\
<m:properties>' +
formatAdoText('Version', result.version) +
formatAdoText('NormalizedVersion', result.version) +
formatAdoText('Copyright', result.copyright) +
formatAdoDate('Created', result.created) +
formatAdoText('Dependencies', result.dependencies.map(function(item) { return item.id + ':' + item.version + ':'; }).join('|')) +
formatAdoText('Description', result.description) +
formatAdoInteger('DownloadCount', result.downloadCount) +
formatAdoText('GalleryDetailsUrl', '') +
formatAdoText('IconUrl', result.icon) +
formatAdoBoolean('IsLatestVersion', result.isLatest) +
formatAdoBoolean('IsAbsoluteLatestVersion', result.isAbsoluteLatest) +
formatAdoBoolean('IsPrerelease', result.isPrerelease) +
formatAdoText('Language', result.language) +
formatAdoDate('Published', result.published) +
formatAdoText('PackageHash', result.packageHash) +
formatAdoText('PackageHashAlgorithm', result.packageHashAlgorithm) +
formatAdoLong('PackageSize', result.packageSize) +
formatAdoText('ProjectUrl', result.projectUrl) +
formatAdoText('ReportAbuseUrl', '') +
formatAdoText('ReleaseNotes', result.releaseNotes) +
formatAdoBoolean('RequireLicenseAcceptance', result.requireLicenseAcceptance) +
formatAdoText('Tags', result.tags.join(' ')) +
formatAdoText('Title', result.title) +
formatAdoInteger('VersionDownloadCount', result.versionDownloadCount) +
formatAdoText('MinClientVersion', result.minClientVersion) +
formatAdoDate('LastEdited', result.lastEdited) +
formatAdoText('LicenseUrl', result.licenseUrl) +
formatAdoText('LicenseNames', '') +
formatAdoText('LicenseReportUrl', '') + '\
</m:properties>\
</entry>';	
}

function formatId(result) {
	return 'Packages(Id=\'' + result.id + '\',Version=\'' + result.version + '\')';
}

function formatAdoText(field, value) {
	return formatText(formatAdoField(field), value);
}

function formatAdoField(field) {
	return 'd:' + field;
}

function formatDate(field, value) {
	return formatText(field, value.toISOString());
}

function formatText(field, value, attr) {
	attr = attr || {};
	
	var str = '';
	
	for(var i in attr) {
		str += ' ' + i + '="' + attr[i].toString() + '"';
	}
	
	if(value === null || value === '' || value === undefined) {
		return '<' + field + str + ' />'; 	
	}
	
	return '<' + field + str + '>' + value.toString() + '</' + field + '>';
}

function formatAdoDate(field, value) {
	field = formatAdoField(field);
	
	if(value) {
		return formatText(field, value.toISOString(), {
			'm:type': 'Edm.DateTime'
		});
	} else {
		return formatText(field, null, {
			'm:type': 'Edm.DateTime',
			'm:null': true
		});
	} 
}

function formatAdoLong(field, value) {
	return formatText(formatAdoField(field), value, {
		'm:type': 'Edm.Int64'
	});
}

function formatAdoInteger(field, value) {
	return formatText(formatAdoField(field), value, {
		'm:type': 'Edm.Int32'
	});
}

function formatAdoBoolean(field, value) {
	return formatText(formatAdoField(field), value, {
		'm:type': 'Edm.Boolean'
	});
}

module.exports = atomParser;