
/**
 * Module dependencies.
 */

var Model = require('model')
  , inherit = require('inherit')
  , request = require('superagent')
  , store = require('./store')
  , fetch = require('./fetch');

/**
 * Module exports.
 */

module.exports = scoped;

/**
 * Scope a model to `name`.
 */

function scoped(type, name) {
  return function(){
    var parent = this;
    function ScopedModel() {
      type.apply(this, arguments);
      var self = this;
      Object.defineProperties(this, {
        url: { value: ScopedModel.url }
      });
      if (parent.model.typeName) this[parent.model.typeName] = parent;
    }
    inherit(ScopedModel, type);

    /**
     * Properties.
     */

    ScopedModel.url = parent.url + '/' + name;
    ScopedModel.parent = parent;

    /**
     * Static methods.
     */

    ScopedModel.get = get;
    ScopedModel.use = Model.use;

    function get(fn) {
      store().get([ this.url ], function(ids, fn){
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
            fn(null, [ new ScopedModel(res.body) ]);
          });
      }, function(err, res){
        if (err) return fn(err);
        fn(null, res[0]);
      });
    }
    return ScopedModel;
  };
}
