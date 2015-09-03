ifdef DEBUG
SIGILOPTS+=--eval '(defconstant +debug+ t)'
endif

MOCHABIN=../node_modules/mocha/bin/mocha
MOCHA=$(MOCHABIN) . && { $(MOCHABIN) . -R html-cov > coverage.html; $(MOCHABIN) --bail . -R mocha-text-cov | tee coverage.txt | grep TOTAL | grep '100%' || { cat coverage.txt; echo 'CODE COVERAGE NOT AT 100%!'; exit 1; } }

%.js: %.ps
	sigil $(SIGILOPTS) $< > $@
	-rm -f test/test
