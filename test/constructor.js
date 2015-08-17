var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (constructor) {
    describe('constructor', function() {
        it('should call the constructor once when creating a new object', function () {
            var init = sinon.spy(function () {});
            var cls = new constructor({
                init: init
            });
            var obj = new cls();
            expect(init.calledOnce).to.be.true;
        });
    });
}
