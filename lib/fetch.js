
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
  console.log(url, ids);
  request
    .post(url)
    .send(ids)
    .end(function(err, res){
      if (err) return fn(err);
      if (res.error) {
        err = new Error(res.text || res.error.message);
        err.code = res.statusCode;
        return fn(err);
      }
      fn(null, res.body);
    });
};
