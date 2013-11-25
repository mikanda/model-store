
/**
 * Module dependencies.
 */

var chai = require('chai')
  , model = require('model')
  , store = require('model-store')
  , factory = require('factorify')
  , should = chai.should();

/**
 * Test models.
 */

var Employee;
var Stamping;

/**
 * Tests.
 */

describe('ModelStore', function(){
  
  /**
   * Factories
   */

  var EmployeeFactory = factory()
    .sequence('_id', 'e')
    .attr('name', function () {
      return chance.name();
    });

  var StampingFactory = factory()
    .sequence('_id', 's')
    .attr('start', function () {
      return chance.date();
    })
    .attr('end', function () {
      return chance.date();
    });

  before(function(){

    // initialize test models

    Stamping = model()
      .use(store('stamping'))
      .attr('_id')
      .attr('start')
      .attr('end');

    // The employee nests the type `Stamping`.  The first part
    // declares the types of the employee and the second part declares
    // the attributes.
    Employee = model()
      .use(store('employee'))
      .attr('_id')

      // this gives the stamping class a new attribute called
      // `employee` which stores the reference to the `Employee`.
      .attr('name')
      .attr('stamping', { ref: Stamping })
      .attr('stamping2', Stamping)
      .attr('stampings', [{ ref: Stamping }])
      .attr('stampings2', [Stamping]);
  });

  // Initialization of a new model-store:

  describe('constructor', function(){
    it('should generate the type-name', function(){

      // The name is stored like the following
      Stamping.typeName.should.equal('stamping');
    });
  });
  describe('.attr()', function(){
    it('should generate the backreference', function(){
      var employee = new Employee({ stamping2: { _id: 1, start: 1, end: 1 } });
      employee.stamping2.should.be.an.instanceof(Stamping);
      employee.stamping2.toJSON().should.eql({ _id: 1, start: 1, end: 1 });
      var EmployeeStamping = employee.stamping;
      should.exist(EmployeeStamping);
      var stamping = new EmployeeStamping({ start: 3 });
      stamping.employee.should.equal(employee);
    });
    it('should generate a valid constructor', function(){
      var employee = new Employee({ _id: '3d45dw' });
      var EmployeeStamping = employee.stamping;
      var stamping = new EmployeeStamping({ start: 3 });
      should.exist(stamping.start);
      stamping.start.should.equal(3);
      new employee.stampings().url.should.equal('/employees/3d45dw/stampings');
      stamping.url.should.equal('/employees/3d45dw/stamping');
    });
  });
  describe('Model', function(){
    describe('.get()', function(){
      var server;
      var employee;
      var spyGet = sinon.spy();
      before(function(){
        var object = JSON.parse(JSON.stringify(new EmployeeFactory()));
        object._id = 'e1000';
        employee = new Employee(object);
        server = sinon.fakeServer.create();
        server.respondWith(
          'GET', /\/employees\/([^/]+)/, function(xhr, id){
            spyGet();
            xhr.respond(200, {
              "Content-Type": "application/json"
            }, JSON.stringify(employee));
          });
      });
      it('should fetch an instance by id', function(done){
        Employee.get(employee._id, function(err, o){
          if (err) return done(err);
          o.toJSON().should.eql(employee.toJSON());
          spyGet.calledOnce.should.be.true;
          done();
        });
        server.respond();
      });
      after(function(){
        server.restore();
      });
    });
    describe('.all()', function(){
      var server;
      var employee;
      var spyGet = sinon.spy();
      var spyPost = sinon.spy();
      before(function(){
        var object = JSON.parse(JSON.stringify(new EmployeeFactory()));
        object._id = 'e1001';
        employee = new Employee(object);
        server = sinon.fakeServer.create();
        server.respondWith(
          'GET', '/employees', function(xhr, id){
            spyGet(xhr);
            xhr.respond(200, {
              "Content-Type": "application/json"
            }, JSON.stringify([employee._id]));
          });
        server.respondWith(
          'POST', '/employees', function(xhr, id){
            spyPost(xhr);
            xhr.respond(200, {
              "Content-Type": "application/json"
            }, JSON.stringify([employee]));
          });
      });
      it('should fetch the whole collection of models', function(done){
        Employee.all(function(err, res){
          if (err) return done(err);
          res.toJSON(true).should.eql([employee.toJSON(true)]);
          spyPost.calledOnce.should.be.true;
          Employee.all(function(err, res){
            if (err) return done(err);
            spyPost.calledOnce.should.be.true;
            res.toJSON(true).should.eql([employee.toJSON(true)]);
            done();
          });
        });
        server.respond();
      });
      after(function(){
        server.restore();
      });
    });
  });
  describe('ScopedModel', function(){
    describe('.get()', function(){
      var server;
      var respondSpy = sinon.spy();
      var stamping = new StampingFactory();
      before(function(){
        server = sinon.fakeServer.create();
        server.respondWith(
          'GET', /\/employees\/([^/]+)\/stamping/, function(xhr, id){
            respondSpy();
            xhr.respond(200, {
              "Content-Type": "application/json"
            }, JSON.stringify(stamping));
          });
      });
      it('should fetch the object reference via the object store', function(done){
        var employee = new Employee({ _id: 'id123' });
        employee.stamping.get(function(err, res){
          if (err) return done(err);
          res.toJSON().should.eql(JSON.parse(JSON.stringify(stamping)));
          store.has('/employees/id123/stamping').should.be.true;
          respondSpy.calledOnce.should.be.true;
          employee.stamping.get(function(err, res){
            respondSpy.calledOnce.should.be.true;
            done();
          });
        });
        server.respond();
      });
      after(function(){
        server.restore();
      });
    });
  });
  describe('ScopedCollection', function(){
    describe('.all()', function(){
      var server;
      var respondSpy = sinon.spy();
      var stamping = new StampingFactory();
      before(function(){
        server = sinon.fakeServer.create();
        server.respondWith(
          'GET', /\/employees\/([^/]+)\/stampings/, function(xhr){
            xhr.respond(200, {
              'Content-Type': 'application/json'
            }, JSON.stringify([stamping._id]));
          });
        server.respondWith(
          'POST', /\/employees\/([^/]+)\/stampings/,
          function(xhr, employee, id){
            employee.should.equal('id123');
            respondSpy();
            xhr.respond(200, {
              'Content-Type': 'application/json'
            }, JSON.stringify([stamping]));
          });
      });
      it('should fetch the object reference via the object store', function(done){
        var employee = new Employee({ _id: 'id123' });
        employee.stampings.all(function(err, res){
          if (err) return done(err);
          res.toJSON().should.eql(JSON.parse(JSON.stringify([stamping])));
          respondSpy.calledOnce.should.be.true;
          employee.stampings.all(function(err, res){
            if (err) return done(err);
            res.toJSON().should.eql(JSON.parse(JSON.stringify([stamping])));
            respondSpy.calledOnce.should.be.true;
            done();
          });
        });
        server.respond();
      });
      after(function(){
        server.restore();
      });
    });
  });

  // Employee.stamping.get();
  // Employee.stampings.all();

  // // use the model
  // var employee = new Employee({ name: 'John Smith' });
  // employee.stampings2.at(1);
  // var Stampings = employee.stampings;
  // var stamping = employee.stampings.create({ start: new Date() });

  // var EmployeeStamping = employee.stampings;
  // new EmployeeStamping();

  // // the stamping has a back-reference to the employee
  // stamping.employee === employee;

  // // save the model
  // employee.save(function(err, res){

  //   // ...

  // });

  // // fetches /employees/:employee/stampings/id58294
  // employee.stampings.get('id58294', function(err, stamping){
  // });

  // employee.stampings.all(function(err, stampings){

  //   // ...

  //   stampings.save();
  // });
});
