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
/* (DEFVAR *CLASS (@ (REQUIRE ../px2.js) *CLASS)) */
var Class = require('../px2.js').Class;
/* (DEFVAR *VIEW (@ (REQUIRE ../px2.js) *VIEW)) */
var View = require('../px2.js').View;
/* (DEFSUITE Class ((REQUIRE ./methods.js) *CLASS)
    ((REQUIRE ./constructor.js) *CLASS) ((REQUIRE ./members.js) *CLASS)
    ((REQUIRE ./defaults.js) *CLASS) ((REQUIRE ./collections.js) *CLASS)
    ((REQUIRE ./events.js) *CLASS) ((REQUIRE ./parents.js) *CLASS)
    ((REQUIRE ./bubbling.js) *CLASS) ((REQUIRE ./iterators.js) *CLASS)) */
describe('Class', function () {
    require('./methods.js')(Class);
    require('./constructor.js')(Class);
    require('./members.js')(Class);
    require('./defaults.js')(Class);
    require('./collections.js')(Class);
    require('./events.js')(Class);
    require('./parents.js')(Class);
    require('./bubbling.js')(Class);
    return require('./iterators.js')(Class);
});
/* (DEFSUITE View ((REQUIRE ./methods.js) *VIEW)
    ((REQUIRE ./constructor.js) *VIEW) ((REQUIRE ./members.js) *VIEW)
    ((REQUIRE ./defaults.js) *VIEW) ((REQUIRE ./collections.js) *VIEW)
    ((REQUIRE ./events.js) *VIEW) ((REQUIRE ./parents.js) *VIEW)
    ((REQUIRE ./bubbling.js) *VIEW) ((REQUIRE ./iterators.js) *VIEW)
    (DEFSUITE view
     (DEFTEST should have a $el member
      (LET ((VIEW (NEW (*VIEW))))
        (ASSERT (@ VIEW $EL) $el memeber is not present in view)
        (DONE)))
     (DEFTEST should have a $el member of type div
      (LET ((VIEW (NEW (*VIEW))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) tagName) DIV
         $el memeber is not a DIV)
        (DONE)))
     (DEFTEST should have a $el member of type span
      (LET ((VIEW (NEW (*VIEW (CREATE tagName SPAN)))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) tagName) SPAN
         $el memeber is not a SPAN)
        (DONE)))
     (DEFTEST should have a $el member of class type 'testing'
      (LET ((VIEW (NEW (*VIEW (CREATE className testing)))))
        (ASSERT-EQUALS ((@ VIEW $EL PROP) class) testing
         $el class name is not 'testing')
        (DONE)))
     (DEFTEST should set the model member
      (LET ((VIEW (NEW (*VIEW (CREATE) 1))))
        (ASSERT-EQUALS (@ VIEW MODEL) 1 view.model is not set to 1)
        (DONE)))
     (DEFTEST should set the model name
      (LET ((VIEW (NEW (*VIEW (CREATE MODEL name) 1))))
        (ASSERT-EQUALS (@ VIEW NAME) 1 view.name is not set to 1)
        (DONE)))
     (DEFTEST should set the css/style member
      (LET ((VIEW (NEW (*VIEW (CREATE STYLE (CREATE font-weight bold))))))
        (ASSERT-EQUALS ((@ VIEW $EL CSS) font-weight) bold
         $el css 'font-weight' is not set to 'bold)
        (DONE)))
     (DEFTEST should set events
      (LET* ((HANDLER ((@ SINON SPY) (LAMBDA ())))
             (VIEW (NEW (*VIEW (CREATE EVENTS (CREATE click HANDLER))))))
        ((@ VIEW $EL CLICK))
        (ASSERT (@ HANDLER CALLED-ONCE) event handler was not called.)
        (DONE)))
     (DEFTEST should set default render function if none given
      (LET ((VIEW (NEW (*VIEW (CREATE EVENTS (CREATE))))))
        (ASSERT (@ VIEW RENDER) default render function was not created.)
        (ASSERT ((@ VIEW RENDER))
                default render function did not return a value.)
        (DONE)))
     (DEFTEST should only augment the render function once
      (LET* ((OPTIONS (CREATE RENDER (LAMBDA () THIS.$EL)))
             (VIEW1 (NEW (*VIEW OPTIONS)))
             (VIEW2 (NEW (*VIEW OPTIONS))))
        (ASSERT (@ OPTIONS RENDER-AUGMENTED) render function was augmented.)
        (ASSERT ((@ VIEW1 RENDER)) render1 function did not return a value.)
        (ASSERT ((@ VIEW2 RENDER)) render2 function did not return a value.)
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
    return describe('view', function () {
        it('should have a $el member', function (done) {
            var view = new View();
            if (!view.$el) {
                throw new Error('$el memeber is not present in view');
            };
            return done();
        });
        it('should have a $el member of type div', function (done) {
            var view = new View();
            if (view.$el.prop('tagName') !== 'DIV') {
                throw new Error('Expected ' + view.$el.prop('tagName') + ' to equal ' + 'DIV' + ': ' + '$el memeber is not a DIV');
            };
            return done();
        });
        it('should have a $el member of type span', function (done) {
            var view = new View({ 'tagName' : 'SPAN' });
            if (view.$el.prop('tagName') !== 'SPAN') {
                throw new Error('Expected ' + view.$el.prop('tagName') + ' to equal ' + 'SPAN' + ': ' + '$el memeber is not a SPAN');
            };
            return done();
        });
        it('should have a $el member of class type \'testing\'', function (done) {
            var view = new View({ 'className' : 'testing' });
            if (view.$el.prop('class') !== 'testing') {
                throw new Error('Expected ' + view.$el.prop('class') + ' to equal ' + 'testing' + ': ' + '$el class name is not \'testing\'');
            };
            return done();
        });
        it('should set the model member', function (done) {
            var view = new View({  }, 1);
            if (view.model !== 1) {
                throw new Error('Expected ' + view.model + ' to equal ' + 1 + ': ' + 'view.model is not set to 1');
            };
            return done();
        });
        it('should set the model name', function (done) {
            var view = new View({ model : 'name' }, 1);
            if (view.name !== 1) {
                throw new Error('Expected ' + view.name + ' to equal ' + 1 + ': ' + 'view.name is not set to 1');
            };
            return done();
        });
        it('should set the css/style member', function (done) {
            var view = new View({ style : { 'font-weight' : 'bold' } });
            if (view.$el.css('font-weight') !== 'bold') {
                throw new Error('Expected ' + view.$el.css('font-weight') + ' to equal ' + 'bold' + ': ' + '$el css \'font-weight\' is not set to \'bold');
            };
            return done();
        });
        it('should set events', function (done) {
            var handler = sinon.spy(function () {
                return null;
            });
            var view = new View({ events : { 'click' : handler } });
            view.$el.click();
            if (!handler.calledOnce) {
                throw new Error('event handler was not called.');
            };
            return done();
        });
        it('should set default render function if none given', function (done) {
            var view = new View({ events : {  } });
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
            var view1 = new View(options);
            var view2 = new View(options);
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
