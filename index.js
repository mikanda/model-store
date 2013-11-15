
/**
 * Module dependencies.
 */

/**
 * Module exports.
 */

module.exports = function(Model){

  /**
   * Private variables.
   */

  var self = Model;

  // save original .attr() method
  var origAttr = Model.attr;

  /**
   * Public methods.
   */

  Model.attr = attr;

  /**
   * Overrides the original .attr() method to define references.
   */

  function attr(name, opts){

    // 'true' if this declares a collection of references
    var refs = (Array.isArray(opts) && opts[0] && opts[0].ref);

    // do the dispatching if this is a attribute processible by this
    // plugin
    if (!refs || !opts.ref) {
      return origAttr.apply(this, arguments);
    }
    if (refs) {

      // generate a collection-class bound to the attribute name
      origAttr.call(this, name, collection(opts[0].ref, name));
    } else {

      // generate a model-class bound to the attribute name
      origAttr.call(this, name, model(opts.ref, name));
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
      preset: Collection(self, name),
      writable: false
    };
  }

  function model(type, name) {
    return {
      preset: Model(self, name),
      writable: false
    };
  }

  /**
   * Generates a model class scoped to `name`.
   *
   * @param {Function} type
   * @param {String} name
   */

  function model(type, name) {
  }
};
