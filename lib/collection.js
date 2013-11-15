
/**
 * This defines the prototype injected into a collection.
 */

/**
 * Module dependencies.
 */

var inherit = require('inherit')
  , map = require('map')
  , request = require('superagent')
  , Collection = require('collection')
  , store = require('./store')
  , fetch = require('./fetch');

/**
 * Module exports.
 */

module.exports = scoped;

/**
 * Generates a scoped collection constructor.
 */

function scoped(parent, name) {
  function ScopedCollection() {
    Collection.apply(this, arguments);
    var self = this;

    Object.defineProperties(this, {
      url: { value: ScopedCollection.url + '/' + this._id }
    });
  }
  inherit(ScopedCollection, Collection);

  /**
   * Properties.
   */

  ScopedCollection.url = parent.url + '/' + name;
  ScopedCollection.parent = parent;

  /**
   * Static methods.
   */

  ScopedCollection.all = all;

  /**
   * Fetches all objects from the server.
   */

  function all(fn) {
    var self = this;
    request
      .get(this.url)
      .end(function(res){
        if (res.error) {
          var err = new Error(res.text);
          err.code = res.statusCode;
          return fn(err);
        }
        store.get(map(res.body, function(id){
          return self.url + '/' + id;
        }), fetch, function(err, objects){
          if (err) return fn(err);
          fn(null, new self(objects));
        });
      });
  }
  return ScopedCollection;
};
