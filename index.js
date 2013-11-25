
/**
 * Module dependencies.
 */

var bind = require('bind')
  , store = require('./lib/store')
  , ModelCtor = require('./lib/model')
  , Collection = require('./lib/collection')
  , statics = require('./lib/statics');

/**
 * Module exports.
 */

exports = module.exports = function(typeName, collectionName){
  collectionName = collectionName || typeName + 's';
  return function(Model){
    exports.has = bind(store(), store().has);

    /**
     * Private variables.
     */

    var self = Model;

    // save original .attr() method
    var origAttr = Model.attr;

    /**
     * Public variables.
     */

    self.typeName = typeName;
    self.collectionName = collectionName;
    self.url = '/' + self.collectionName;

    /**
     * Public methods.
     */

    self.attr = attr;

    // Load statics.
    for (var key in statics) {
      if (!statics.hasOwnProperty(key)) continue;
      Model[key] = statics[key];
    }
    Model.on('construct', function(inst){
      inst.url = Model.url + '/' + inst._id;
    });

    /**
     * Overrides the original .attr() method to define references.
     */

    function attr(name, opts){

      // 'true' if this declares a collection of references
      var refs = (Array.isArray(opts) && opts[0] && opts[0].ref);

      // do the dispatching if this is a attribute processible by this
      // plugin
      if (!refs && !(opts && opts.ref)) {
        return origAttr.apply(this, arguments);
      }
      if (refs) {

        // generate a collection-class bound to the attribute name
        return origAttr.call(this, name, collection(opts[0].ref, name));
      } else {

        // generate a model-constructor bound to the attribute
        // name
        origAttr.call(this, name, model(opts.ref, name));
        return this;
      }
    };

    /**
     * Generates a collection class scoped to `name`.  Means that calls
     * to the communication methods lead to urls like:
     *
     *   /top-level/<name>/
     *
     * @param {Function} type the type constructor
     * @param {String} name the name to scope to
     */

    function collection(type, name) {
      return {
        compute: Collection(type, name),
        persistent: false,
        writable: false
      };
    }

    function model(type, name) {
      return {
        compute: ModelCtor(type, name),
        persistent: false,
        writable: false
      };
    }
  };
};
exports.init = store;
