var ControlsView = View({
    type: 'ControlsView',
    model: 'app',
    init: function (model) {
        this.create('selectContainer', new FileInfoSelectContainerView());
        this.create('instrumentSelect', new InstrumentSelectView(app.instruments()));
        this.create('playback', new PlaybackView(app));
        this.create('volume', new VolumeView(app));
    },
    render: function () {
        var html = [
            this.selectContainer().$el,
            this.instrumentSelect().$el,
            this.playback().$el,
            this.volume().$el
        ]
        this.$el.html(html);
    },

    beat: function (n) {
        this.playback().beat(n);
    },
    measure: function (n) {
        this.playback().measure(n);
    }
});
