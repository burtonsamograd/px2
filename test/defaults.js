var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (constructor) {
    it('should initialize defaults properly', function () {
        var cls = constructor({
            defaults: {
                'a': 0
            }
        });
        var obj = new cls();
        expect(obj.a).to.be.a.function;
        expect(obj.a()).to.equal(0);
    });
}
