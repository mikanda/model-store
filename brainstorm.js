
// Initialization of a new model-store:

var store = ModelStore();

// Create a stamping model class which is then nested into the
// employee class.

var Stamping = model('stamping')
  .use(store())
  .attr('start')
  .attr('end');

// The name is stored like the following
Stamping.typeName === 'stamping';

// The employee nests the type `Stamping`.  The first part declares
// the types of the employee and the second part declares the
// attributes.

var Employee = model('employee')
  .use(store())

  // this gives the stamping class a new attribute called `employee`
  // which stores the reference to the `Employee`.
  .attr('name')
  .attr('stampings', { ref: Stamping })
  .attr('stampings2', { ref: Stamping })

  // ...
  ;

// use the model
var employee = new Employee({ name: 'John Smith' });
var stamping = new employee.stampings.create({ start: new Date() });

// the stamping has a back-reference to the employee
stamping.employee === employee;

// save the model
employee.save(function(err, res){

  // ...

});

// fetches /employees/:employee/stampings/id58294
employee.stampings.get('id58294', function(){
});

employee.stampings.all(function(){
});
