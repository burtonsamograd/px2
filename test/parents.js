var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('parent relationships', function () {
        var obj, obj2, handler, col, col2;
        beforeEach(function () {
            obj = new cls({
                init: function () {
                    this.create('a');
                    this.create('b', 1);
                }
            });
            obj2 = new cls({
                init: function () {
                    this.create('a');
                    this.create('b', 1);
                }
            });
            col = new cls();
            col2 = new cls();
            handler = sinon.spy(function (e) {});
        });
        if('should call a handler on a collection when an object is in it', function () {
            col.add(obj);
            col.on('change', handler);
            obj.a(1);
            expect(handler.calledOnce).to.be.true;
        });
        it('should call a the handlers on collections when an object is in them (parent relationships)', function () {
            col.add(obj);
            col2.add(obj);
            col.on('change', handler);
            col2.on('change:a', handler);
            obj.a(1);
            expect(handler.calledTwice).to.be.true;
        });

        it('should trigger events on enclosing object after an object is added using set', function () {
            obj.set('a', obj2);
            obj.on('change', handler);
            obj2.a(1);
            expect(handler.calledOnce).to.be.true;
        });

        it('should not trigger events on encosing object after an object is removed using set', function () {
            obj.set('a', obj2);
            obj.on('change', handler);
            obj2.a(1);
            obj.a(1);
            obj2.a(2);
            expect(handler.calledOnce).to.be.false;
        });

        it('should trigger events on enclosing object after an object is added normally and using set', function () {
            obj.set('a', obj2);
            obj.add(obj2);
            obj.on('change', handler);
            obj2.a(1);
            expect(handler.calledTwice).to.be.true;
        });
        it('should trigger events on enclosing object after an object was added using  defaults', function () {
            var inner = new cls({
                defaults: {
                    a: 0
                }
            });
            var outer = new cls({
                defaults: {
                    inner: inner
                }
            });

            outer.on('change', handler);
            outer.inner().a(1);
            expect(handler.calledOnce).to.be.true;
        });
    });
}
