var VolumeUpButtonView = View({
    type: 'TinyButton VolumeUpButtonView',
    model: 'app',
    events: {
        'click': function () {
            this.app.volumeUp();
        }
    }
});

var VolumeDownButtonView = View({
    type: 'TinyButton VolumeDownButtonView',
    model: 'app',
    events: {
        'click': function () {
            this.app.volumeDown();
        }
    }
});

var VolumeControlsView = View({
    type: 'VolumeControlsView',
    init: function (model) {
        this.create('up', new VolumeUpButtonView(model));
        this.create('down', new VolumeDownButtonView(model));
    },
    render: function () {
        var html = [
            this.up().$el,
            this.down().$el,
        ];
        return this.$el.html(html);
    }
});

var VolumeToggleButtonView = View({
    type: 'LargeButton VolumeToggleButtonView',
    model: 'app',
    events: {
        'click': function () {
            var isMuted = app.volumeMute();
            if(isMuted) {
                this.$el.addClass('VolumeMuteButtonView');
                this.$el.removeClass('VolumeToggleButtonView');
            } else {
                this.$el.removeClass('VolumeMuteButtonView');
                this.$el.addClass('VolumeToggleButtonView');
            }
        }
    }
});

var VolumeView = View({
    type: 'VolumeView',
    init: function (model) {
        this.create('toggle', new VolumeToggleButtonView(model));
        this.create('controls', new VolumeControlsView(model));
    },
    render: function () {
        var html = [
            this.toggle().$el,
            this.controls().$el
        ];
        return this.$el.html(html);
    }
});
