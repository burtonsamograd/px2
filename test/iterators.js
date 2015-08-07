var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('iterators', function () {
        var obj;
        beforeEach(function () {
            obj = new cls();
        });
        it('show map over objects', function () {
            var o = new cls();
            o.add(1);
            o.add(2);
            o.add(3);
            var results = o.map(function (x) { return x + 1; });
            expect(results).to.eql([2,3,4]);
        });
        it('should each over objects', function () {
            var o = new cls();
            o.add(1);
            o.add(2);
            o.add(3);
            var result = 0;
            o.each(function (x) { result += x; });
            expect(result).to.eql(6);
        });
        it('should filter over objects', function () {
            var o = new cls();
            o.add(1);
            o.add(2);
            o.add(3);
            var result = o.filter(function (x) { return (x % 2) === 0; });
            expect(result).to.eql([2]);
        });
        it('should find things in the object', function () {
            var o = new cls();
            o.add(1);
            o.add(2);
            o.add(3);
            var result = o.find(function (x) { return x === 3; });
            expect(result).to.equal(3);
        });
        it('should not find things not in the object', function () {
            var o = new cls();
            o.add(1);
            o.add(2);
            o.add(3);
            var result = o.find(function (x) { return x === 4; });
            expect(result).to.equal(undefined);
        });

        it('should sort the collection', function () {
            var o = new cls();
            o.add(3);
            o.add(1);
            o.add(2);
            var result = o.sort(function (a, b) { return a - b; }).map(function (x) { return x; });
            expect(result).to.eql([1,2,3]);
            expect(o._storage).to.eql([1,2,3]);
        });
    });
}
