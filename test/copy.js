var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('copy', function () {
        var obj;
        beforeEach(function () {
            obj = new cls();
        });
        it('show copy objects', function () {
            var o = new cls();
            var o2 = new cls();
            o.create('x', 1);
            o.create('y', o2);
            o2.create('z', 1);
            o.add(1);
            o.add(o2);
            var handler = sinon.spy(function () {});
            o.on('x', handler, {});
            o.on('y', handler);
            var o3 = o.copy();
            expect(o3.x()).to.equal(1);
            expect(o3.y().z()).to.equal(1);
            expect(o3.at(0)).to.equal(1);
            expect(o3.at(1).z()).to.equal(1);
            expect(o3.trigger.bind(o3, 'x')).to.not.throw(Error);
            expect(o3.trigger.bind(o3, 'y')).to.not.throw(Error);
            expect(handler.calledTwice).to.be.true;
        });
    });
}
