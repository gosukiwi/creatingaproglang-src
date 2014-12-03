# Book source code
All source code for the [Creating a Programming
Language](https://leanpub.com/creatingaproglang) book can be found in `src/`,
tests reside in `tests/`.

# Running tests
You'll need mocha to run tests, then simply run mocha test/

    npm install -g mocha
    mocha test/

# Generating JISON grammar
In order to generate the Jison grammar, you'll need to install jison and then
run it using `src/grammar.jison` as input.

  npm install -g jison
  jison src/grammar.jison -o src/grammar.js
