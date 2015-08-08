var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('members', function () {
        var obj;
        beforeEach(function () {
            obj = new cls({
                init: function () {
                    this.create('a');
                    this.create('b', 1);
                }
            });
        });
        it('should have a length member of 0', function () {
            expect(obj.length).to.equal(0);
        });
        it('should create new member getter/setter', function () {
            expect(obj.a).to.be.a.function;
        });
        it('should assign values when creating new member (using get)', function () {
            expect(obj.get('b')).to.equal(1);
        });
        it('should assign values when creating new member (using getter)', function () {
            expect(obj.b()).to.equal(1);
        });
        it('should be able to set values (using set)', function () {
            expect(obj.a()).to.equal(undefined);
            obj.set('a', 2);
            expect(obj.a()).to.equal(2);
        });
        it('should be able to set values (using setter)', function () {
            expect(obj.a()).to.equal(undefined);
            obj.a(2);
            expect(obj.a()).to.equal(2);
        });
        it('should be able to create new members at runtime independent of other members', function () {
            obj.create('c', 3);
            expect(obj.c).to.be.a.function;
            expect(obj.get('c')).to.equal(3);
            expect(obj.c()).to.equal(3);
            expect(obj.a()).to.equal(undefined);
            expect(obj.b()).to.equal(1);
        });
        it('should throw an error when attepting to create a duplicate member', function () {
            expect(obj.create.bind(obj, 'a')).to.throw(Error);
        });
        it('should throw an error when attepting to set an unknown member', function () {
            expect(obj.set.bind(obj, 'z')).to.throw(Error);
        });
        it('should destroy members', function () {
            obj.destroy('a');
            expect(obj.set.bind(obj, 'a')).to.throw(Error);
            expect(obj.get.bind(obj, 'a')).to.throw(Error);
            expect(obj.a).to.equal(undefined);
            expect(obj._actions['change:a']).to.be.undefined;
        });
    });
}
