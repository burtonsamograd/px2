var expect = require('chai').expect,
    sinon = require('sinon');

module.exports = function (constructor) {
    var cls = constructor({});
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
            var clsa = constructor({type:'cs', contains: 'c'});
            var clsb = constructor({type:'c'});
            var c = new clsa();
            var o = new clsb();
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
            var clsa = constructor({type:'cs', contains: 'c'});
            var clsb = constructor({type:'d'});
            var c = new clsa();
            var o = new clsb();
            expect(c.add.bind(c, o)).to.throw(Error);
        });
        it('should only allow adding a certain type to the collection if specified using push', function () {
            var clsa = constructor({type:'cs', contains: 'c'});
            var clsb = constructor({type:'d'});
            var c = new clsa();
            var o = new clsb();
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
        it('should return the correct index of a value if it is in the collection', function () {
            var c = new cls();
            var o1 = new cls();
            var o2 = new cls();
            var o3 = new cls();
            c.add(o1);
            c.add(o2);
            c.add(o3);
            expect(c.indexOf(o1)).to.equal(0);
            expect(c.indexOf(o2)).to.equal(1);
            expect(c.indexOf(o3)).to.equal(2);
        })
        it('should return undefined for the index of a value if it is not in the collection', function () {
            var c = new cls();
            var o1 = new cls();
            var o2 = new cls();
            var o3 = new cls();
            var o4 = new cls();
            c.add(o1);
            c.add(o2);
            c.add(o3);
            expect(c.indexOf(o4)).to.equal(undefined);
        })
        it('should insert at a given index', function () {
            var c = new cls();
            var o1 = new cls();
            var o2 = new cls();
            var o3 = new cls();
            var o4 = new cls();
            c.add(o1);
            c.add(o2);
            c.add(o3);
            c.insertAt(1, o4);
            expect(c.indexOf(o4)).to.equal(1);
            expect(c.indexOf(o1)).to.equal(0);
            expect(c.indexOf(o2)).to.equal(2);
            expect(c.indexOf(o3)).to.equal(3);
            expect(c.length).to.equal(4);
        })
        it('should swap values', function () {
            var c = new cls();
            var o1 = new cls();
            var o2 = new cls();
            c.add(o1);
            c.add(o2);
            c.swap(0, 1);
            expect(c.indexOf(o1)).to.equal(1);
            expect(c.indexOf(o2)).to.equal(0);
        })
        it('should not add the same parent twice', function () {
            var c = new cls();
            var o1 = new cls();
            c.add(o1);
            c.add(o1);
            expect(o1._parents.length).to.equal(1);
        })
    });
}
