/* (LOAD test-macros.ps) */

/* (CODE-COVERAGE /px2\//) */
require('blanket')({ 'pattern' : function (filename) {
    return !/node_modules/.test(filename) && /px2\//.test(filename);
} });
/* (SETF $ ((REQUIRE jquery) (CHAIN ((@ (REQUIRE jsdom) JSDOM)) DEFAULT-VIEW))) */
$ = require('jquery')(require('jsdom').jsdom().defaultView);
/* (DEFVAR EXPECT (@ (REQUIRE chai) EXPECT)) */
var expect = require('chai').expect;
/* (DEFVAR SINON (REQUIRE sinon)) */
var sinon = require('sinon');
/* (DEFVAR *MODEL (@ (REQUIRE ../px2.js) *MODEL)) */
var Model = require('../px2.js').Model;
/* (DEFVAR *VIEW (@ (REQUIRE ../px2.js) *VIEW)) */
var View = require('../px2.js').View;
/* (DEFSUITE Class ((REQUIRE ./methods.js) *MODEL)
    ((REQUIRE ./constructor.js) *MODEL) ((REQUIRE ./members.js) *MODEL)
    ((REQUIRE ./defaults.js) *MODEL) ((REQUIRE ./collections.js) *MODEL)
    ((REQUIRE ./events.js) *MODEL) ((REQUIRE ./parents.js) *MODEL)
    ((REQUIRE ./bubbling.js) *MODEL) ((REQUIRE ./iterators.js) *MODEL)
    ((REQUIRE ./copy.js) *MODEL) ((REQUIRE ./serialize.js) *MODEL)) */
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
    require('./copy.js')(Model);
    return require('./serialize.js')(Model);
});
/* (DEFSUITE View ((REQUIRE ./methods.js) *VIEW)
    ((REQUIRE ./constructor.js) *VIEW) ((REQUIRE ./members.js) *VIEW)
    ((REQUIRE ./defaults.js) *VIEW) ((REQUIRE ./collections.js) *VIEW)
    ((REQUIRE ./events.js) *VIEW) ((REQUIRE ./parents.js) *VIEW)
    ((REQUIRE ./bubbling.js) *VIEW) ((REQUIRE ./iterators.js) *VIEW)
    ((REQUIRE ./copy.js) *VIEW) ((REQUIRE ./serialize.js) *VIEW)
    (DEFSUITE view
     (DEFTEST should have a $el member
      (LET* ((CLS (NEW (*VIEW))) (VIEW (NEW (CLS))))
        (ASSERT (@ VIEW $EL) $el memeber is not present in view)
        (DONE)))
     (DEFTEST should have a $el member of type div
      (LET* ((CLS (NEW (*VIEW))) (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) tagName) DIV
         $el memeber is not a DIV)
        (DONE)))
     (DEFTEST should have a $el member of type span
      (LET* ((CLS (NEW (*VIEW (CREATE tagName SPAN)))) (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) tagName) SPAN
         $el memeber is not a SPAN)
        (DONE)))
     (DEFTEST should have a $el member of class type 'testing'
      (LET* ((CLS (NEW (*VIEW (CREATE className testing)))) (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) class) testing
         $el class name is not 'testing')
        (DONE)))
     (DEFTEST
      should automatically set the class name to type if className is not provided
      (LET* ((CLS (NEW (*VIEW (CREATE type testing)))) (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) class) testing
         automatic class name is not 'testing')
        (DONE)))
     (DEFTEST
      should automatically set the class name to className if it is provided
      (LET* ((CLS (NEW (*VIEW (CREATE className testing)))) (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) class) testing
         automatic class name is not 'testing')
        (DONE)))
     (DEFTEST
      should automatically set the class name when className is provided
      (LET* ((CLS (NEW (*VIEW (CREATE type testing className testing2))))
             (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) class) testing2
         automatic class name is not 'testing2')
        (DONE)))
     (DEFTEST
      should automatically append to className to type as the class name when className starts with a space
      (LET* ((CLS (NEW (*VIEW (CREATE type testing className  testing2))))
             (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) class) testing testing2
         automatic class name is not 'testing testing2')
        (DONE)))
     (DEFTEST should set the model member
      (LET* ((CLS (NEW (*VIEW))) (VIEW (NEW (CLS 1))))
        (ASSERT-EQUALS (@ VIEW MODEL) 1 view.model is not set to 1)
        (DONE)))
     (DEFTEST should set the model name
      (LET* ((CLS (NEW (*VIEW (CREATE MODEL name)))) (VIEW (NEW (CLS 1))))
        (ASSERT-EQUALS (@ VIEW NAME) 1 view.name is not set to 1)
        (DONE)))
     (DEFTEST should set the css/style member
      (LET* ((CLS (NEW (*VIEW (CREATE STYLE (CREATE font-weight bold)))))
             (VIEW (NEW (CLS))))
        (ASSERT-EQUALS ((@ VIEW $EL CSS) font-weight) bold
         $el css 'font-weight' is not set to 'bold)
        (DONE)))
     (DEFTEST should set events
      (LET* ((HANDLER ((@ SINON SPY) (LAMBDA ())))
             (CLS (*VIEW (CREATE EVENTS (CREATE click HANDLER))))
             (VIEW (NEW (CLS))))
        ((@ VIEW $EL CLICK))
        (ASSERT (@ HANDLER CALLED-ONCE) event handler was not called.)
        (DONE)))
     (DEFTEST should set default render function if none given
      (LET* ((CLS (NEW (*VIEW (CREATE EVENTS (CREATE))))) (VIEW (NEW (CLS))))
        (ASSERT (@ VIEW RENDER) default render function was not created.)
        (ASSERT ((@ VIEW RENDER))
                default render function did not return a value.)
        (DONE)))
     (DEFTEST should only augment the render function once
      (LET* ((OPTIONS (CREATE RENDER (LAMBDA () THIS.$EL)))
             (CLS (*VIEW OPTIONS))
             (VIEW1 (NEW (CLS)))
             (VIEW2 (NEW (CLS))))
        (ASSERT (@ OPTIONS RENDER-AUGMENTED) render function was augmented.)
        (ASSERT ((@ VIEW1 RENDER)) render1 function did not return a value.)
        (ASSERT ((@ VIEW2 RENDER)) render2 function did not return a value.)
        (DONE)))
     (DEFTEST automatically call the render function on construction
      (LET* ((RENDER ((@ SINON SPY) (LAMBDA ())))
             (CLS (*VIEW (CREATE RENDER RENDER)))
             (VIEW (NEW (CLS))))
        (ASSERT (@ RENDER CALLED-ONCE) render was not called during init.)
        (DONE))))) */
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
    require('./serialize.js')(View);
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
        it('should automatically set the class name to type if className is not provided', function (done) {
            var cls = new View({ 'type' : 'testing' });
            var view = new cls();
            if (view.$el.prop('class') !== 'testing') {
                throw new Error('Expected ' + view.$el.prop('class') + ' to equal ' + 'testing' + ': ' + 'automatic class name is not \'testing\'');
            };
            return done();
        });
        it('should automatically set the class name to className if it is provided', function (done) {
            var cls = new View({ 'className' : 'testing' });
            var view = new cls();
            if (view.$el.prop('class') !== 'testing') {
                throw new Error('Expected ' + view.$el.prop('class') + ' to equal ' + 'testing' + ': ' + 'automatic class name is not \'testing\'');
            };
            return done();
        });
        it('should automatically set the class name when className is provided', function (done) {
            var cls = new View({ 'type' : 'testing', 'className' : 'testing2' });
            var view = new cls();
            if (view.$el.prop('class') !== 'testing2') {
                throw new Error('Expected ' + view.$el.prop('class') + ' to equal ' + 'testing2' + ': ' + 'automatic class name is not \'testing2\'');
            };
            return done();
        });
        it('should automatically append to className to type as the class name when className starts with a space', function (done) {
            var cls = new View({ 'type' : 'testing', 'className' : ' testing2' });
            var view = new cls();
            if (view.$el.prop('class') !== 'testing testing2') {
                throw new Error('Expected ' + view.$el.prop('class') + ' to equal ' + 'testing testing2' + ': ' + 'automatic class name is not \'testing testing2\'');
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
        it('should only augment the render function once', function (done) {
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
        return it('automatically call the render function on construction', function (done) {
            var render = sinon.spy(function () {
                return null;
            });
            var cls = View({ render : render });
            var view = new cls();
            if (!render.calledOnce) {
                throw new Error('render was not called during init.');
            };
            return done();
        });
    });
});
