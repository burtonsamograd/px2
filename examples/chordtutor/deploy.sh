DIR=~/burtonsamograd.github.io/chordtutor

make clean
make index.html
cp index.html $DIR
cd $DIR
git commit -a -m 'Update Chord Tutor.'
git push origin master
