
/**
 * Module dependencies.
 */

var request = require('superagent')
  , map = require('map')
  , Collection = require('collection')
  , fetch = require('./fetch')
  , store = require('./store');

/**
 * Module exports.
 */

exports.get = function(id, fn){
  var Model = this;
  var url = this.url + '/' + id;
  store().get([ url ], function(ids, fn){
    var url = ids[0];
    request
      .get(url)
      .end(function(err, res){
        if (err) return fn(err);
        if (res.error) {
          err = new Error(res.text || res.error.message);
          err.code = res.statusCode;
          return fn(err);
        }
        fn(null, [ new Model(res.body) ]);
      });
  }, function(err, res){
    if (err) return fn(err);
    fn(null, res[0]);
  });
};

exports.all = function(fn){
  var self = this;
  request
    .get(this.url)
    .end(function(err, res){
      if (err) return fn(err);
      if (res.error) {
        return fn(new Error(res.text || res.error.message));
      }
      store().get(map(res.body, function(id){
        return self.url + '/' + id;
      }), fetch, function(err, res){
        if (err) return fn(err);
        fn(null, new Collection(res, self));
      });
    });
};
