var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('constructor', function() {
        it('should call the constructor once when creating a new object', function () {
            var init = sinon.spy(function () {});
            var obj = new cls({
                init: init
            });
            expect(obj.init.calledOnce).to.be.true;
        });
    });
}
