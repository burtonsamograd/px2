var Counter = Model({
    type: 'Counter',
    init: function (text) {
        this.create('times', 0);
    },

    inc: function () {
        return this.times(this.times()+1);
    }
});

var ClickView = View({
    type: 'ClickView',
    model: "counter",
    events: {
        'click': function (e) {
            this.counter.inc();
        }
    },
    init: function (model) {
        this.counter.on('change', this.render, this);
    },
    render: function () {
        return this.$el.text("This text has been clicked: " + this.counter.times() + " times.");
    }
});

var counter = new Counter();
var clickView = new ClickView(counter);

$(document).ready(function () {
    $('body').html(clickView.$el);
})
