
var Store = require('object-store');
var store;
module.exports = function(opts){
  if (!store) store = new Store(opts);
  return store;
};
