
var Store = require('object-store');
var store;
module.exports = function(opts){
  if (!store) {
    if (opts && opts.store) return store = opts.store;
    store = new Store(opts);
  }
  return store;
};
