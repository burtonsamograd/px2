var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (constructor) {
    var cls = constructor({
        init: function () {
            this.create('a');
            this.create('b', 1);
        }
    });

    describe('events', function () {
        var obj, handler, event;
        beforeEach(function () {
            obj = new cls();
            handler = sinon.spy(function (e) { event = e; });
        });
        afterEach(function () {
            proto = obj = col = col2 = event = handler = null;
        });
        it('should detect a change and call a handler', function () {
            obj.on('change', handler);
            obj.a(1);
            obj.b(2);
            expect(handler.calledTwice).to.be.true;
        });
        it('should detect a change in a specific member and call a handler', function () {
            obj.on('change:a', handler);
            obj.a(1);
            expect(handler.calledOnce).to.be.true;
        });
        it('should detect changes call a handler when required', function () {
            obj.on('change', handler);
            obj.on('change:a', handler);
            obj.a(1);
            expect(handler.calledTwice).to.be.true;
        });
        it('should detect get and call a handler when loud is passed, but not when loud is not', function () {
            obj.on('get', handler);
            obj.on('get:a', handler);
            obj.a();
            expect(handler.called).to.be.false;
            obj.get('a', true); // loud options only allowed on
                                // traditional get call, not named
                                // getter setter
            expect(handler.calledTwice).to.be.true;
        });
        it('should not call a handler when a variable has not been changed', function () {
            obj.on('change:a', handler);
            obj.b(1);
            expect(handler.called).to.be.false;
        });
        it('should call the handler multiple times when the same trigger is set', function () {
            obj.on('change:a', handler);
            obj.on('change:a', handler);
            obj.a(1);
            expect(handler.calledTwice).to.be.true;
        });
        it('should call the handler multiple times when the same trigger is set with once', function () {
            obj.once('change:a', handler);
            obj.once('change:a', handler);
            obj.a(1);
            expect(handler.calledTwice).to.be.true;
        });
        it('should only call the handler once when once is used', function () {
            obj.once('change:a', handler);
            obj.a(1);
            obj.a(1);
            expect(handler.calledOnce).to.be.true;
        });
        it('should bind this properly by default in handler', function () {
            obj.on('change', function (e) {
                expect(this).to.equal(obj)
            });
            obj.a(1);
        });
        it('should bind this properly in handler', function () {
            obj.on('change', function (e) {
                expect(this).to.eql({a:2})
            }, {a:2});
            obj.a(1);
        });
        it('should not recursively call trigger when x includes y and y includes x', function () {
            // x is a container that contains type y, y is a container that contains type x
            // adding to x should not blow the stack by recursively calling trigger
            var X = { type: 'X', contains: 'Y' };
            var Y = { type: 'Y', contains: 'X' };
            var clsa = constructor(X);
            var clsb = constructor(Y);

            var x = new cls();
            var y = new cls();
            x.create(x, y);
            y.create(y, x);

            x.add(y);
            y.add(x);
        });
        it('should not call a handler when silent is given to create', function () {
            obj.on('create', handler);
            obj.create('x', 1, true);
            obj.create('y', 2, true);
            expect(handler.called).to.be.false;
        });
        it('should not call a handler when silent is given to named get/set', function () {
            obj.on('change', handler);
            obj.a(1, true);
            obj.b(2, true);
            expect(handler.called).to.be.false;
        });
        it('should not call a handler when silent is given to add', function () {
            obj.on('modified', handler);
            obj.add(1, true);
            obj.add(2, true);
            expect(handler.called).to.be.false;
        });
        it('should not call a handler when silent is given to remove', function () {
            obj.on('modified', handler);
            obj.add(1);
            obj.add(2);
            obj.remove(2, true);
            obj.remove(1, true);
            expect(handler.calledTwice).to.be.true;
        });
        it('should not call a handler when silent is given to push', function () {
            obj.on('modified', handler);
            obj.push(1, true);
            obj.push(2, true);
            expect(handler.called).to.be.false;
        });
        it('should not call a handler when silent is given to clear', function () {
            obj.on('modified', handler);
            obj.push(1);
            obj.push(2);
            obj.clear(true);
            expect(handler.calledTwice).to.be.true;
        });
        it('should call a handler when calling sort', function () {
            obj.push(1);
            obj.push(2);
            obj.on('modified', handler);
            obj.sort(function (a, b) { return a - b; });
            expect(handler.calledOnce).to.be.true;
        });

        it('should be able to create a random variable using a loud getter.', function () {
            obj.create('random');
            obj.on('get:random', function (e) {
              return this.random(Math.random());
            });
            var a = obj.get('random', true);
            expect(obj.get('random', true)).to.not.equal(a);
        });
    });
}
