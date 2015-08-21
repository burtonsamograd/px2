var splitAndFilter = function  (str, separator) {
  return _.filter(str.split(separator), function(s) { return !!s.trim(); });
};

var Parser = function (file) {
  this.file = file;
  this.songData = {};
};

Parser.prototype.do = function() {
  var bodyArray = splitAndFilter(this.file, ':'); 

  // header
  var header = this.extractHeader(bodyArray);
  this.parseHeader(header);

  // sections
  this.parseSections(bodyArray);
  return this.songData;    
};

Parser.prototype.extractHeader = function (bodyArray) {
  var index = -1;
  for (var i = 0; i < bodyArray.length; i++) {
    if (bodyArray[i].indexOf("section=") > -1) {
        index = i;
        break;
    }
  } 

  var header;
  if (index !== -1) {
    header = bodyArray.splice(0, index);
  }

  return header;
};

Parser.prototype.parseHeader = function (header) {
  if (header.length < 1)
    return;

  _.each(header, function (s) {
    if (s.indexOf('title=') > -1) {
      this.songData.title = s.split('title=')[1];
    } else if (s.indexOf('author=') > -1) {
      this.songData.author = s.split('author=')[1];
    } else if (s.indexOf('beatsPerMinute=') > -1) {
      this.songData.beatsPerMinute = s.split('beatsPerMinute=')[1];
    } else if (s.indexOf('beatsPerMeasure=') > -1) {
      this.songData.beatsPerMeasure = s.split('beatsPerMeasure=')[1];
    } else if (s.indexOf('key=') > -1) {
      this.songData.key = s.split('key=')[1];
    }
  }, this);
};

Parser.prototype.parseSections = function (sectionArray) {  
  this.songData.sections = [];
  var lastSection;
  var measure = 0;
  _.each(sectionArray, function (s) {
    if (s.indexOf('section=') > -1) {
      lastSection = {};
      lastSection.name = s.split('section=')[1];
      lastSection.measure = measure;
      lastSection.chords = []; 
    } else if (lastSection) {
      lastSection.chords = splitAndFilter(s, '|');
      measure += lastSection.chords.length;
      this.songData.sections.push(lastSection);
    }
  }, this);
};

/*
var parser = new Parser(mock_file);
parser.do();

console.log(parser.songData);
*/
