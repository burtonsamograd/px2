// MIDI note numbers: http://www.electronics.dit.ie/staff/tscarff/Music_technology/midi/midi_note_numbers_for_octaves.htm
var chordToMIDIMap = {
  // primary
  maj:   [0, 4, 7], // the numbers are intervals from 0 as tonic
  min:   [0, 3, 7],
  sus4:  [0, 5, 7],
  // extensions
  dom7:    [0, 4, 7, 10],
  min7:    [0, 3, 7, 10],
  maj7:    [0, 4, 7, 11],
  minmaj7: [0, 3, 7, 11]
};

var chordSymbols = ['m', 'M', '7', '4'];
var chordTypes = {
  'm':    'min',
  'M':    'maj',
  'm7':   'min7',
  '7':    'dom7',
  'M7':   'maj7',
  '4':    'sus4',
  'mM7':  'minmaj7' 
};

var accidentals = {
  'b':    -1, // flat
  '#':    +1, // sharp
  'bb':   -2, // double-flat
  '##':   +2  // double-sharp
};

var midiNumLookup = {
  'C':   60,
  'C#':  61,  
  'Db':  this['C#'],
  'D':   62,
  'D#':  63,
  'Eb':  this['D#'],
  'E':   64,
  'Fb':  this['E'],
  'F':   65,
  'F#':  66,
  'Gb':  this['F#'],
  'G':   67,
  'G#':  68,
  'Ab':  this['G#'],
  'A':   69,
  'A#':  70,
  'Bb':  this['A#'],
  'B':   71,
  'Cb':  this['B']
};

var getChordNoteAndType = function (chord) {
  var result = []; // note, type
  var note = "";
  var type = "";
  for (var i = 0; i < chord.length; i++) {
    var tok = chord[i];
    if (chordSymbols.indexOf(tok) > -1) {
      type += tok;
    }
  }
  note = chord.replace(type, "");

  if (!type) type = 'M';
  result.push(note);
  result.push(type);
  return result;
};

var Streamer = function (songData) {
  this.songData = songData; 
  this.streamData = [];
};

Streamer.prototype.do = function () {

// The format is [measure#, beat#, duration, midi_notes_array]
// [
//   [0, 0, 4, [60, 64, 67]],
//   [1, 0, 2, [60, 64, 67]],
//   [1, 2, 2, [65, 69, 72]],
//   ...
// ]
  var bpMeas = this.songData.beatsPerMeasure;

  for (var i = 0; i < this.songData.sections.length; i++) {
    var section = this.songData.sections[i];
    var sectionChords = section.chords;
    for (var j = 0; j < sectionChords.length; j++) {
      var bar = splitAndFilter(sectionChords[j], ' ');
      var duration = bpMeas / bar.length;
      for (var k = 0; k < bar.length; k++) {
        var chord = bar[k];
        var songEvent = [section.measure + j, k * duration, duration]; // [measure#, beat#, duration, midi_notes_array]
        var noteAndType = getChordNoteAndType(chord);
        var note = midiNumLookup[noteAndType[0]];
        var type = noteAndType[1];
        var relMidiValues = chordToMIDIMap[chordTypes[type]]; // this is relative

        // convert relative to actual
        var midiValue = _.map(relMidiValues, function (x) {
          return (note + x);
        });
        songEvent.push(midiValue);
        this.streamData.push(songEvent);
      }
    }
  }

  return this.streamData;
};

// Usage:
//var parser = new Parser(file);
//var parser_output = parser.do();
//var streamer = new Streamer(parser_output);
//console.log(streamer.do());



