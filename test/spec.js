
require('blanket')({ 'pattern' : function (filename) {
    return !/node_modules/.test(filename) && /px2\//.test(filename);
} });
$ = require('jquery')(require('jsdom').jsdom().defaultView);
var expect = require('chai').expect;
var sinon = require('sinon');
var Model = require('../px2.js').Model;
var View = require('../px2.js').View;
describe('Class', function () {
    require('./methods.js')(Model);
    require('./constructor.js')(Model);
    require('./members.js')(Model);
    require('./defaults.js')(Model);
    require('./collections.js')(Model);
    require('./events.js')(Model);
    require('./parents.js')(Model);
    require('./bubbling.js')(Model);
    require('./iterators.js')(Model);
    return require('./copy.js')(Model);
});
describe('View', function () {
    require('./methods.js')(View);
    require('./constructor.js')(View);
    require('./members.js')(View);
    require('./defaults.js')(View);
    require('./collections.js')(View);
    require('./events.js')(View);
    require('./parents.js')(View);
    require('./bubbling.js')(View);
    require('./iterators.js')(View);
    require('./copy.js')(View);
    return describe('view', function () {
        it('should have a $el member', function (done) {
            var cls = new View();
            var view = new cls();
            if (!view.$el) {
                throw new Error('$el memeber is not present in view');
            };
            return done();
        });
        it('should have a $el member of type div', function (done) {
            var cls = new View();
            var view = new cls();
            if (view.$el.prop('tagName') !== 'DIV') {
                throw new Error('Expected ' + view.$el.prop('tagName') + ' to equal ' + 'DIV' + ': ' + '$el memeber is not a DIV');
            };
            return done();
        });
        it('should have a $el member of type span', function (done) {
            var cls = new View({ 'tagName' : 'SPAN' });
            var view = new cls();
            if (view.$el.prop('tagName') !== 'SPAN') {
                throw new Error('Expected ' + view.$el.prop('tagName') + ' to equal ' + 'SPAN' + ': ' + '$el memeber is not a SPAN');
            };
            return done();
        });
        it('should have a $el member of class type \'testing\'', function (done) {
            var cls = new View({ 'className' : 'testing' });
            var view = new cls();
            if (view.$el.prop('class') !== 'testing') {
                throw new Error('Expected ' + view.$el.prop('class') + ' to equal ' + 'testing' + ': ' + '$el class name is not \'testing\'');
            };
            return done();
        });
        it('should set the model member', function (done) {
            var cls = new View();
            var view = new cls(1);
            if (view.model !== 1) {
                throw new Error('Expected ' + view.model + ' to equal ' + 1 + ': ' + 'view.model is not set to 1');
            };
            return done();
        });
        it('should set the model name', function (done) {
            var cls = new View({ model : 'name' });
            var view = new cls(1);
            if (view.name !== 1) {
                throw new Error('Expected ' + view.name + ' to equal ' + 1 + ': ' + 'view.name is not set to 1');
            };
            return done();
        });
        it('should set the css/style member', function (done) {
            var cls = new View({ style : { 'font-weight' : 'bold' } });
            var view = new cls();
            if (view.$el.css('font-weight') !== 'bold') {
                throw new Error('Expected ' + view.$el.css('font-weight') + ' to equal ' + 'bold' + ': ' + '$el css \'font-weight\' is not set to \'bold');
            };
            return done();
        });
        it('should set events', function (done) {
            var handler = sinon.spy(function () {
                return null;
            });
            var cls = View({ events : { 'click' : handler } });
            var view = new cls();
            view.$el.click();
            if (!handler.calledOnce) {
                throw new Error('event handler was not called.');
            };
            return done();
        });
        it('should set default render function if none given', function (done) {
            var cls = new View({ events : {  } });
            var view = new cls();
            if (!view.render) {
                throw new Error('default render function was not created.');
            };
            if (!view.render()) {
                throw new Error('default render function did not return a value.');
            };
            return done();
        });
        return it('should only augment the render function once', function (done) {
            var options = { render : function () {
                return this.$el;
            } };
            var cls = View(options);
            var view1 = new cls();
            var view2 = new cls();
            if (!options.renderAugmented) {
                throw new Error('render function was augmented.');
            };
            if (!view1.render()) {
                throw new Error('render1 function did not return a value.');
            };
            if (!view2.render()) {
                throw new Error('render2 function did not return a value.');
            };
            return done();
        });
    });
});
