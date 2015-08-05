var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    it('should initialize defaults properly', function () {
        var obj = new cls({
            defaults: {
                'a': 0
            }
        });
        expect(obj.a).to.be.a.function;
        expect(obj.a()).to.equal(0);
    });
}
