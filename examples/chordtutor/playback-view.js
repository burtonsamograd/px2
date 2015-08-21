var PlayButtonView = View({
    type: 'PlayButtonView',
    model: 'player',
    className: "LargeButton PlayButtonView",
    events: {
        'click': function (e) {
            if(this.player.playing())
                this.player.pause()
            else
                this.player.play()
        }
    },

    init: function(model) {
        this.player.on('change:playing', this.render, this);
    },

    render: function () {
        var isPaused = this.player.playing();
        if(isPaused){
            this.$el.addClass('PlayButtonPausedView');
            this.$el.removeClass('PlayButtonView');
        } else {
            this.$el.addClass('PlayButtonView');
            this.$el.removeClass('PlayButtonPausedView');
        }
    }
});

var StopButtonView = View({
    type: 'StopButtonView',
    model: 'player',
    className: "LargeButton StopButtonView",
    events: {
        'click': function (e) {
            this.player.stop();
        }
    }
});

var PlaybackControlsView = View({
    type: 'PlaybackControlsView',
    model: 'player',
    init: function (model) {
        this.create('play', new PlayButtonView(this.player));
        this.create('stop', new StopButtonView(this.player));
    },
    render: function () {
        var html = [
            this.play().$el,
            this.stop().$el
        ];
        return this.$el.html(html);
    }
});

var TempoLabelView = View({
    type: 'TempoLabelView'
});

var TempoValueView = View({
    type: 'TempoValueView',
    model: 'app',
    events: {
        'mousewheel': function (e) {
            // TODO: make work in Firefox
            var delta = Math.max(-1, Math.min(1, (e.originalEvent.wheelDelta ||
                                                  -e.originalEvent.detail)));
            if(delta > 0) {
                for(var i = 0; i < delta; i++) {
                    this.app.tempoUp();
                }
            } else {
                for(var i = 0; i < -delta; i++) {
                    this.app.tempoDown();
                }
            }

            // TODO: Why don't you stop scroll?
            e.preventDefault();
        }
    },
    init: function () {
        this.app.on('change:tempo', this.render, this);
        this.app.player().on('beat', function (e) {
            this.$el.addClass('TempoValueViewBeat');
            var self = this;
            setTimeout(function () {
                self.$el.removeClass('TempoValueViewBeat');
            }, 250);
        }, this);
    },
    render: function () {
        return this.$el.text(this.app.tempo());
    }
});

var TempoUpButtonView = View({
    type: 'TempoUpButtonView',
    className: 'TinyButton TempoUpButtonView',
    model: 'app',
    events: {
        'click': function (e) {
            app.tempoUp();
        }
    }
});

var TempoDownButtonView = View({
    type: 'TempoDownButtonView',
    className: 'TinyButton TempoDownButtonView',
    model: 'app',
    events: {
        'click': function (e) {
            app.tempoDown();
        }
    }
});

var TempoLabelValueContainerView = View({
    type: 'TempoLabelValueContainerView',
    init: function (model) {
        this.create('label', new TempoLabelView(model));
        this.create('value', new TempoValueView(model));
    },
    render: function () {
        var html = [
            this.label().$el,
            this.value().$el,
        ];
        return this.$el.html(html);
    }
});

var TempoControlsView = View({
    type: 'TempoControlsView',
    init: function (model) {
        this.create('up', new TempoUpButtonView(model));
        this.create('down', new TempoDownButtonView(model));
    },
    render: function () {
        var html = [
            this.up().$el,
            this.down().$el,
        ];
        return this.$el.html(html);
    }
});

var TempoView = View({
    type: 'TempoView',
    model: 'app',
    init: function () {
        this.create('container', new TempoLabelValueContainerView(this.app));
        this.create('controls', new TempoControlsView(this.app));
    },
    render: function () {
        var html = [
            this.container().$el,
            this.controls().$el,
        ];
        return this.$el.html(html);
    }
});

var TransposeLabelView = View({
    type: 'TransposeLabelView'
});

var TransposeValueView = View({
    type: 'TransposeValueView',
    model: 'app',
    init: function () {
        this.app.on('change:transpose', this.render, this);
    },
    render: function () {
        return this.$el.text(this.app.player().transpose());
    }
});

var TransposeLabelValueContainerView = View({
    type: 'TransposeLabelValueContainerView',
    model: 'app',
    init: function(){
        this.create('label', new TransposeLabelView(this.app));
        this.create('value', new TransposeValueView(this.app));
    },
    render: function(){
        var html = [
            this.label().$el,
            this.value().$el
        ];
        return this.$el.html(html);
    }
});

var TransposeUpButtonView = View({
    type: 'TransposeUpButtonView',
    className: 'TinyButton TransposeUpButtonView',
    model: 'app',
    events: {
        'click': function (e) {
            app.transposeUp();
        }
    }
});

var TransposeDownButtonView = View({
    type: 'TransposeDownButtonView',
    className: 'TinyButton TransposeDownButtonView',
    model: 'app',
    events: {
        'click': function (e) {
            app.transposeDown();
        }
    }
});

var TransposeControlsView = View({
    type: 'TransposeControlsView',
    model: 'app',
    init: function() {
        this.create('up', new TransposeUpButtonView(this.app));
        this.create('down', new TransposeDownButtonView(this.app));
    },
    render: function() {
        var html = [
            this.up().$el,
            this.down().$el
        ];
        return this.$el.html(html);
    }
});

var TransposeView = View({
    type: 'TransposeView',
    model: 'app',
    init: function () {
        this.create('container', new TransposeLabelValueContainerView(this.app));
        this.create('controls', new TransposeControlsView(this.app));
    },
    render: function () {
        var html = [
            this.container().$el,
            this.controls().$el
        ];
        return this.$el.html(html);
    }
});

var PlaybackView = View({
    type: 'PlaybackView',
    model: 'app',
    init: function (model) {
        this.create('playback', new PlaybackControlsView(this.app.player()));
        this.create('tempo', new TempoView(this.app));
        this.create('transpose', new TransposeView(this.app));
    },
    render: function () {
        var html = [
            this.playback().$el,
            this.tempo().$el,
            this.transpose().$el
        ];
        return this.$el.html(html);
    },
    beat: function (n) {
    },
    measure: function (n) {
    }

});
