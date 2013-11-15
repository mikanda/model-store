
/**
 * Module dependencies.
 */

var Model = require('model')
  , inherit = require('inherit')
  , store = require('./store')
  , fetch = require('./fetch');

/**
 * Module exports.
 */

module.exports = scoped;

/**
 * Scope a model to `name`.
 */

function scoped(parent, name) {
  function ScopedModel() {
    Model.apply(this, arguments);
    var self = this;
  }
  inherit(ScopedModel, Model);

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

  function get(id, fn) {
    store.get([ id ], fetch, fn);
  }
  return ScopedModel;
}
