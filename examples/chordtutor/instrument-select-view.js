var InstrumentSelectNameView = View({
    type: 'InstrumentSelectNameView',
    model: 'instrument',
    init: function (model) {
    },
    render: function () {
        var s = this.instrument.name();
        this.$el.html(s.charAt(0).toUpperCase() + s.slice(1));
    }
});

var InstrumentSelectNextButtonView = View({
    type: 'TinyButton InstrumentSelectNextButtonView',
    model: 'instruments',
    events: {
        'click': function (e) {
            this.instruments.next(true);
            this.trigger('select', this.instruments.current());
        }
    }
});

var InstrumentSelectPrevButtonView = View({
    type: 'TinyButton InstrumentSelectPrevButtonView',
    model: 'instruments',
    events: {
        'click': function (e) {
            this.instruments.prev(true);
            this.trigger('select', this.instruments.current());
        }
    }
});

var InstrumentSelectControlsView = View({
    type: 'InstrumentSelectControlsView',
    model: 'instruments',
    init: function () {
        this.create('next', new InstrumentSelectNextButtonView(instruments));
        this.create('prev', new InstrumentSelectPrevButtonView(instruments));

    },
    render: function () {
        var html = [
            this.next().$el,
            this.prev().$el
        ];
        return this.$el.html(html);
    }
});

var InstrumentSelectView = View({
    type: 'InstrumentSelectView',
    model: 'instruments',
    init: function (model) {
        
        this.create('name', new InstrumentSelectNameView(this.instruments.start()));
        this.create('controls', new InstrumentSelectControlsView(model));
        this.trigger('instrument', this.instruments.at(0));
        this.on('select', function (e) {
            this.name(new InstrumentSelectNameView(this.instruments.current()));
            this.trigger('instrumentSelect', e.value);
            this.render();
        });
    },
    render: function () {
        var html = [
            this.controls().$el,
            this.name().$el
        ];
        return this.$el.html(html);
    }
});

