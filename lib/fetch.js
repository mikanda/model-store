
/**
 * Network adapter for the object-store.
 */

/**
 * Module dependencies.
 */

var request = require('superagent')
  , map = require('map');

/**
 * Module exports.
 */

module.exports = function(ids, fn){
  var url;
  ids = map(ids, function(id){
    var parts = id.split('/');
    url = id.replace(/\/[^/]+$/, '');
    return parts[0];
  });
  request
    .post(url)
    .end(function(res){
      if (res.error) {
        var err = new Error(res.text);
        err.code = res.statusCode;
        return fn(err);
      }
      fn(null, res.body);
    });
};
