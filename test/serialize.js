var expect = require('chai').expect,
    sinon = require('sinon');
/*
 * Test of model serialization.
 * See comments below for what looks to work and what doesn't.
 */
module.exports = function (constructor) {
    describe('serialize', function () {
        var options = { a: function () { return true; },
                        events: { click: function () { return this.b; } },
                        b: 31337,
                        c: "a string",
                        defaults: {
                            xx: 1
                        }
                      };
        var cls = constructor(options);
        it('should serialize and load objects', function () {
            var o = new cls();
            var o2 = new cls();
            var o3 = new cls();

            //var cls2 = constructor({x:o2});
            //var o4 = new cls2();
            
            o.create('x', 1);
            o.create('y', o2);
            o2.create('z', 1);
            o.add(1);
            o.add(o2);
            o.xx(42);
            o.xx(42);
            var handler = function () { counter++; };
            o.on('x', handler, {});
            o.on('y', handler);

            // This is hopefully uncommon in models (but not views), I
            // hope, beacuse it doesn't work
            // o.on('z', handler, o3);

            var object = o.serialize();
            var json = JSON.stringify(object);
            expect(typeof object).to.equal('object');
            var parsed = JSON.parse(json);
            expect(parsed.members).to.be.ok;
            expect(parsed.storage).to.be.ok;
            expect(parsed.options).to.be.ok;

            var o3 = new cls().load(JSON.parse(json), true);
            
            expect(o3.x()).to.equal(1);
            expect(o3.y().z()).to.equal(1);
            expect(o3.at(0)).to.equal(1);
            expect(o3.at(1).z()).to.equal(1);
            expect(o3.xx).to.be.ok;
            expect(o3.xx()).to.equal(42);
            expect(o3.a()).to.be.true;
            expect(o3.b).to.equal(31337);
            expect(o3.c).to.equal('a string');
            expect(o3._options.events.click.call(o3)).to.equal(31337);

            counter=0;
            expect(o3.trigger.bind(o3, 'x')).to.not.throw(Error);
            expect(counter).to.equal(1); // closures don't work
            expect(o3.trigger.bind(o3, 'y')).to.not.throw(Error);
            expect(counter).to.equal(2); // but global references do
        });
    });
}
