var sin = new Instrument('sine');
var triangle = new Instrument('triangle');
var square = new Instrument('square');
var saw = new Instrument('sawtooth');
var instruments = new Instruments();
instruments.add(triangle);
instruments.add(square);
instruments.add(saw);
instruments.add(sin);

/*
var rawSong = {
    title: 'my first song',
    author: 'xxx',
    beatsPerMinute: 120,
    beatsPerMeasure: 4,
    key: 'C',
    sections: [
        {
            name: 'Intro',
            measure: 0,
            chords: ['C', 'F', 'F', 'C']
        },
        {
            name: 'Verse1',
            measure: 5,
            chords: ['Am', 'E', 'Am', 'Am']
        }
    ]
}
*/

var app = new App(instruments);
var appView = new AppView(app);

$(document).ready(function () {
    $('body').html(appView.$el);
});
