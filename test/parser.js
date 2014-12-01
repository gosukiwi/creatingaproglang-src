/* global describe, it */
'use strict';


describe('Parser', function () {
  var assert    = require('assert');
  var Tokenizer = require('../src/tokenizer.js');
  var tokenizer = new Tokenizer();
  var Parser    = require('../src/parser.js');

  function parse(str) {
    var tokens = tokenizer.tokenize(str);
    var parser = new Parser(tokens);
    return parser.parse();
  }

  describe('Statements', function () {
    describe('Assignments', function () {
      it('it should work with numbers', function () {
        assert.deepEqual([
          {
            NAME: 'ASSIGNMENT',
            LHS: { NAME: 'IDENTIFIER', VALUE: 'a' },
            RHS: { NAME: 'NUMBER', VALUE: 1 },
          }
        ], parse('a = 1'));
      });

      it('it should work with strings', function () {
        assert.deepEqual([
          {
            NAME: 'ASSIGNMENT',
            LHS: { NAME: 'IDENTIFIER', VALUE: 'a' },
            RHS: { NAME: 'STRING', VALUE: 'some string' },
          }
        ], parse('a = "some string"'));
      });

      it('it should work with function calls', function () {
        assert.deepEqual([
          {
            NAME: 'ASSIGNMENT',
            LHS: { NAME: 'IDENTIFIER', VALUE: 'a' },
            RHS: { NAME: 'FUNCTION_CALL', FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'f' }, ARGUMENTS: [{NAME: 'NUMBER', VALUE: 1}] },
          }
        ], parse('a = f(1)'));
      });
    });

    it('should parse function calls', function () {
      assert.deepEqual([
        {
          NAME: 'FUNCTION_CALL',
          FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'f' },
          ARGUMENTS: [ { NAME: 'NUMBER', VALUE: 1 } ]
        }
      ], parse('f(1)'));
    });
  });

  describe('Expressions', function () {
  });
});
