var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (constructor) {
    describe('iterators', function () {
        var cls = constructor({});
        var obj;
        var a;
        beforeEach(function () {
            obj = new cls();
            a = new cls();
            a.add(1);
            a.add(2);
            a.add(3);
            
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

        it('should select the first element as current on start', function () {
            expect(a.start()).to.equal(1);
            expect(a.current()).to.equal(1);
        });

        it('should select the last element as current on end', function () {
            expect(a.end()).to.equal(3);
            expect(a.current()).to.equal(3);
        });

        it('should select the next element on next', function () {
            a.start();
            expect(a.next()).to.equal(2);
        });

        it('should select the previous element on prev', function () {
            a.end();
            expect(a.prev()).to.equal(2);
        });

        it('should return undefined when at the last element and next is called', function () {
            a.end();
            expect(a.next()).to.equal(undefined);
        });

        it('should return undefined when at the first element and prev is called', function () {
            a.start();
            expect(a.prev()).to.equal(undefined);
        });

        it('should not return undefined when at the last element and next is called with the loop option', function () {
            a.end();
            expect(a.next(true)).to.equal(1);
        });

        it('should not return undefined when at the first element and prev is called with the loop option', function () {
            a.start();
            expect(a.prev(true)).to.equal(3);
        });

        it('should return the current object', function () {
            a.start();
            expect(a.current()).to.equal(1);
            a.next();
            expect(a.current()).to.equal(2);
        });

        it('should set the current object using indexes', function () {
            var a = new cls();
            var b = new cls();
            var c = new cls();
            var d = new cls();

            a.add(b);
            a.add(c);
            a.add(d);
            a.start();
            expect(a.current()).to.equal(b);
            expect(a.current(0)).to.equal(b);
            expect(a.current()).to.equal(b);
            expect(a.current(1)).to.equal(c);
            expect(a.current()).to.equal(c);
            expect(a.current(2)).to.equal(d);
            expect(a.current()).to.equal(d);
        });

        it('should set the current object using objects', function () {
            var a = new cls();
            var b = new cls();
            var c = new cls();
            var d = new cls();

            a.add(b);
            a.add(c);
            a.add(d);
            a.start();
            expect(a.current()).to.equal(b);
            expect(a.current(a)).to.equal(undefined);
            expect(a.current(b)).to.equal(b);
            expect(a.current()).to.equal(b);
            expect(a.current(c)).to.equal(c);
            expect(a.current()).to.equal(c);
            expect(a.current(d)).to.equal(d);
            expect(a.current()).to.equal(d);
        });

        it('should iterate over members using forIn', function () {
            var a = new cls();
            a.create('a', 1);
            a.create('b', 2);
            a.create('c', 3);
            var keys = [];
            var values = [];

            a.forIn(function (k, v) {
                keys.push(k);
                values.push(v);
            });

            expect(keys).to.eql(['a', 'b', 'c']);
            expect(values).to.eql([1,2,3]);
        });
    });
}
