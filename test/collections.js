var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (cls) {
    describe('collections', function () {
        it('should allow adding to the collection', function () {
            var c = new cls();
            var o = new cls();
            expect(c.add.bind(c, o)).to.not.throw(Error);
            expect(c.length).to.equal(1);
            expect(c.at(0)).to.equal(o);
        });
        it('should not allow adding duplicates to the collection', function () {
            var c = new cls();
            var o = new cls();
            expect(c.add.bind(c, o)).to.not.throw(Error);
            expect(c.add.bind(c, o)).to.not.throw(Error);
            expect(c.length).to.equal(1);
            expect(c.at(0)).to.equal(o);
        });
        it('should allow pushing duplicates to the collection', function () {
            var c = new cls();
            var o = new cls();
            expect(c.push.bind(c, o)).to.not.throw(Error);
            expect(c.push.bind(c, o)).to.not.throw(Error);
            expect(c.length).to.equal(2);
            expect(c.at(0)).to.equal(o);
            expect(c.at(1)).to.equal(o);
        });
        it('should allow adding multiple items to the collection', function () {
            var c = new cls();
            var o1 = new cls();
            var o2 = new cls();
            expect(c.add.bind(c, o1)).to.not.throw(Error);
            expect(c.add.bind(c, o2)).to.not.throw(Error);
            expect(c.length).to.equal(2);
            expect(c.at(0)).to.equal(o1);
            expect(c.at(1)).to.equal(o2);
        });
        it('should allow removal from the collection', function () {
            var c = new cls();
            var o = new cls();
            c.add(o);
            c.remove(o);
            expect(c._storage).to.eql([]);
            expect(c.length).to.equal(0);
        });
        it('should allow adding a certain type to the collection if specified', function () {
            var c = new cls({type:'cs', contains: 'c'});
            var o = new cls({type:'c'});
            expect(c.add.bind(c, o)).to.not.throw(Error);
        });
        it('should not allow adding an object twice', function () {
            var c = new cls();
            var o = new cls();
            c.add(o);
            c.add(o);
            expect(c.length).to.equal(1);
        });
        it('should only allow adding a certain type to the collection if specified', function () {
            var c = new cls({type:'cs', contains: 'c'});
            var o = new cls({type:'d'});
            expect(c.add.bind(c, o)).to.throw(Error);
        });
        it('should only allow adding a certain type to the collection if specified using push', function () {
            var c = new cls({type:'cs', contains: 'c'});
            var o = new cls({type:'d'});
            expect(c.push.bind(c, o)).to.throw(Error);
        });
        it('should clear the collection', function () {
            var c = new cls();
            var o = new cls();
            c.add(o);
            c.clear();
            expect(c._storage).to.eql([]);
            expect(c.length).to.equal(0);
        });
        it('should throw an error when referencing outside of the collection', function () {
            var c = new cls();
            var o = new cls();
            c.add(o);
            expect(c.at.bind(c, 1)).to.throw(Error);
        });
    });
}
