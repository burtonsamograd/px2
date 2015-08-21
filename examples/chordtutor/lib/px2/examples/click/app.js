var Message = Model({
    type: 'Message',
    init: function (text) {
        this.create('text', text);
    }
});

var ClickView = View({
    type: 'ClickView',
    model: "message",
    events: {
        'click': function (e) {
            this.times(this.times()+1);
        }
    },
    init: function (model) {
        this.create('times', 0);

        this.on('change:times', this.render);
    },
    render: function () {
        return this.$el.text(this.message.text() + " " + this.times() + " times.");
    }
});

var message = new Message("You have clicked this: ");
var clickView = new ClickView(message);

$(document).ready(function () {
    $('body').html(clickView.$el);
})
