var HelloWorld = Model({
    type: 'HelloWorld',
    init: function (message) {
        this.create('message', message);
    }
});

var HelloWorldView = View({
    type: 'HelloWorldView',
    model: "helloworld",
    render: function () {
        return this.$el.text(this.helloworld.message());
    }
});

var helloWorld = new HelloWorld("Hello, World from PX2!");
var helloWorldView = new HelloWorldView(helloWorld);

$(document).ready(function () {
    $('body').html(helloWorldView.$el);
})
