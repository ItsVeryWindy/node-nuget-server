var Hapi = require('hapi');

var NugetServer = require('./nuget-server');
var db = require('./databases/sqlite');
var config = require('./config');
var atomParser = require('./atom-parser');

var server = new NugetServer(db, config.apiKey);

var app = new Hapi.Server();

app.connection({ port: config.port });

var options = {
    opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        events: { log: '*', response: '*' }
    }]
};

app.route({
  method: 'GET',
  path: '/',
  handler: function (req, reply) {
    server.index(config.url, function (content) {
      reply(content).type('application/xml');
    });
  }
});

app.route({
  method: 'GET',
  path: '/$metadata',
  handler: function (req, reply) {
    server.metadata(function (stream) {
      reply(stream).type('application/xml');
    });
  }
});

app.route({
  method: 'GET',
  path: '/Search()',
  handler: function (req, reply) {
    server.search(req.query.includePrerelease, req.query.orderby, req.query.$filter, req.query.searchTerm, req.query.skip, req.query.top, function(results) {
      var content = atomParser(config.url, 'Search', results);
    
      reply(content).type('application/atom+xml;type=feed;charset=utf-8').ttl(60000);
    });
  }
});

app.route({
  method: 'GET',
  path: '/Search()/$count',
  handler: function (req, reply) {
    server.count(req.query.includePrerelease, req.query.orderby, req.query.$filter, req.query.searchTerm, function(count) {
      reply(count).type('text/plain');
    });
  }
});

app.route({
  method: 'GET',
  path: '/FindPackagesById()',
  handler: function (req, reply) {
    server.findPackagesById(req.query.id, function(results) {
      var content = atomParser(config.url, 'FindPackagesById', results);
    
      reply(content).type('application/atom+xml;type=feed;charset=utf-8');
    });
  }
});

app.route({
  method: 'GET',
  path: '/package/{id}/{version}',
  handler: function (req, reply) {
    server.download(req.params.id, req.params.version, function (stream) {
      reply(stream)
        .type('application/zip')
        .header('Content-Disposition: attachment; filename="' + req.params.id + '.' + req.params.version + '.nupkg"');
    }, function() {
      reply('Package version not found', 404);
    });
  }
});

app.route(pushRoute('/api/v2/package/'));
app.route(pushRoute('/'));

function pushRoute(path) {
  return {
    method: 'PUT',
    path: path,
    handler: function (req, reply) {
      server.push('', req.payload.package, function (err) {
        if(err) return reply().code(400);
        
        reply().code(200);
      });
    },
    config: {
      payload: {
        //maxBytes: 209715200,
        output:'stream',
        parse: true,
        allow: 'multipart/form-data'
      }
    }
  };
}

app.route({
    method: '*',
    path: '/{p*}',
    handler: function (request, reply) {
        console.log(request.path);
        reply().code(404);
    }
});

app.register({
    register: require('good'),
    options: options
}, function (err) {
    if (err) {
        console.error(err);
    } else {
        app.start(function () {
            console.info('Server started at ' + app.info.uri);
        });
    }
});