DEPS=parser.js streamer.js models.js volume-view.js playback-view.js instrument-select-view.js file-info-view.js controls-view.js song-view.js app-view.js app.js

LIBS=lib/jquery/dist/jquery.js lib/px2/px2.js lib/underscore/underscore.js 

all.js: $(LIBS) $(DEPS)
	cat $(LIBS) $(DEPS) > $@

all.css: style.css lib/font-awesome/css/font-awesome.css
	cat $^ > $@

index.html: app.min.js style.min.css
	./compile.sh > index.html

min: app.min.js style.min.css
.DUMMY: deploy min 

app.min.js: all.js
	uglify -s all.js -o app.min.js

parser.min.js: parser.js
	uglify -s parser.js -o parser.min.js

streamer.min.js: streamer.js
	uglify -s streamer.js -o streamer.min.js

style.min.css: all.css
	uglify -c -s all.css -o style.min.css

clean:
	rm -f all.js all.css app.min.js style.min.css index.html
