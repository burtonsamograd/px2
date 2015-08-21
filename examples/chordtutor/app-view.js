var AppView = View({
    type: 'AppView',
    model: 'app',
    init: function (model) {
        this.create('controls', new ControlsView(this.app));
        this.create('song', new SongView());

        // route
        this.app.on('beat', function (e) {
            this.controls().beat(e.value);
            this.song().beat(e.value);
        }, this);;
        this.app.on('measure', function (e) {
            this.controls().measure(e.value);
            this.song().measure(e.value);
        }, this);
        this.app.on('chordFinished', function (e) {
            this.song().chordFinished(e.value);
        }, this);

        var self = this;
        this.on('load', function (e) {
            this.app.load(e.value, function (songInfo) {
                self.song(new SongView(songInfo));
                self.render();
            });
        }, this);

        this.on('instrumentSelect', function (e) {
            this.app.setInstrument(e.value);
        });

        model.loadDefaultSong(function(songInfo) {
            self.song(new SongView(songInfo));
            self.render();
        });
    },

    render: function () {
        var html = [
            this.controls().$el,
            this.song().$el
        ];
        // TODO: set html title
        this.$el.html(html);
    }
});
