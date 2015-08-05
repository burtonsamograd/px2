var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('methods', function () {
        var obj;
        beforeEach(function () {
            obj = new cls();
        });
        it('should create a new function for object creation', function () {
            var proto = new cls();
            expect(proto).to.be.a.function;
        });
        it('a view should have a create method', function () {
            expect(obj.create).to.be.a.function;
        });
        it('a view should have a get method', function () {
            expect(obj.get).to.be.a.function;
        });
        it('a view should have a set method', function () {
            expect(obj.set).to.be.a.function;
        });
        it('a view should have a trigger method', function () {
            expect(obj.trigger).to.be.a.function;
        });
        it('a view should have a on method', function () {
            expect(obj.on).to.be.a.function;
        });
        it('a view should have a off method', function () {
            expect(obj.off).to.be.a.function;
        });
        it('a view should have a add method', function () {
            expect(obj.on).to.be.a.function;
        });
        it('a view should have a at method', function () {
            expect(obj.at).to.be.a.function;
        });
        it('a view should have an each method', function () {
            expect(obj.each).to.be.a.function;
        });
        it('a view should have a map method', function () {
            expect(obj.map).to.be.a.function;
        });
        it('a view should have a filter method', function () {
            expect(obj.filter).to.be.a.function;
        });
    });
}
