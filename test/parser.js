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

    describe('Function calls', function () {
      it('should work with an argument', function () {
        assert.deepEqual([
          {
            NAME: 'FUNCTION_CALL',
            FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: [ { NAME: 'NUMBER', VALUE: 1 } ]
          }
        ], parse('f(1)'));
      });

      it('should work with several arguments', function () {
        assert.deepEqual([
          {
            NAME: 'FUNCTION_CALL',
            FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: [ { NAME: 'NUMBER', VALUE: 1 }, { NAME: 'STRING', VALUE: 'b' }, { NAME: 'NUMBER', VALUE: 2 } ]
          }
        ], parse('f(1, "b", 2)'));
      });

      it('should work without arguments', function () {
        assert.deepEqual([
          {
            NAME: 'FUNCTION_CALL',
            FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: []
          }
        ], parse('f()'));
      });

      it('should work with function calls as arguments', function () {
        assert.deepEqual([
          {
            NAME: 'FUNCTION_CALL',
            FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: [{
              NAME: 'FUNCTION_CALL',
              FUNCTION_NAME: { NAME: 'IDENTIFIER', VALUE: 'g' },
              ARGUMENTS: [{NAME: 'IDENTIFIER', VALUE: 'a'}]
            }]
          }
        ], parse('f(g(a))'));
      });
    });

    describe('If statement', function () {
      it('should work with an expression', function () {
        assert.deepEqual([{
          NAME: 'IF',
          CONDITION: { NAME: 'NUMBER', VALUE: 1 },
          BLOCK: [{ NAME: 'ASSIGNMENT', LHS: { NAME: 'IDENTIFIER', VALUE: 'a' }, RHS: { NAME: 'STRING', VALUE: 'hello' } }]
        }], parse('if 1\na = "hello"\nend'));
      });
    });
  });
});
