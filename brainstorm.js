
// Initialization of a new model-store:

var store = ModelStore();

// Create a stamping model class which is then nested into the
// employee class.

var Stamping = Employee.model('stamping')
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
  .attr('stamping', { ref: Stamping })
  .attr('stamping', Stamping)
  .attr('stampings', [{ ref: Stamping }])
  .attr('stampings2', [Stamping])

  // ...
  ;

Employee.stamping.get();
Employee.stampings.all();

// use the model
var employee = new Employee({ name: 'John Smith' });
employee.stampings2.at(1);
var Stampings = employee.stampings;
var stamping = employee.stampings.create({ start: new Date() });

var EmployeeStamping = employee.stampings;
new EmployeeStamping();

// the stamping has a back-reference to the employee
stamping.employee === employee;

// save the model
employee.save(function(err, res){

  // ...

});

// fetches /employees/:employee/stampings/id58294
employee.stampings.get('id58294', function(err, stamping){
});

employee.stampings.all(function(err, stampings){

  // ...

  stampings.save();
});
