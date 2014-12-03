/* global describe, it */
'use strict';

describe('Parser', function () {
  var assert = require('assert');
  var parser = require('../src/grammar.js').parser;

  function parse(input) {
    return parser.parse(input);
  }

  describe('Statements', function () {
    describe('Assignments', function () {
      it('it should work with numbers', function () {
        assert.deepEqual([
          {
            TYPE: 'ASSIGNMENT',
            LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' },
            RHS: { TYPE: 'NUMBER', VALUE: 1 },
          }
        ], parse('a = 1'));
      });

      it('it should work with strings', function () {
        assert.deepEqual([
          {
            TYPE: 'ASSIGNMENT',
            LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' },
            RHS: { TYPE: 'STRING', VALUE: 'some string' },
          }
        ], parse('a = "some string"'));
      });

      it('it should work with function calls', function () {
        assert.deepEqual([
          {
            TYPE: 'ASSIGNMENT',
            LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' },
            RHS: { TYPE: 'FUNCTION_CALL', NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' }, ARGUMENTS: [{TYPE: 'NUMBER', VALUE: 1}] },
          }
        ], parse('a = f(1)'));
      });
    });

    describe('Function definitions', function () {
      it('should work with a super simple function', function () {
        assert.deepEqual([{
          TYPE: 'FUNCTION_DEFINITION',
          NAME: 'my_func',
          ARGUMENTS: [],
          BODY: []
        }], parse('def my_func()\nend'));
      });

      it('should work with a not so simple function', function () {
        assert.deepEqual([{
          TYPE: 'FUNCTION_DEFINITION',
          NAME: 'my_func',
          ARGUMENTS: [],
          BODY: [{ TYPE: 'ASSIGNMENT', LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' }, RHS: { TYPE: 'NUMBER', VALUE: 1 } }]
        }], parse('def my_func()\na = 1\nend'));
      });
    });

    describe('Function calls', function () {
      it('should work with an argument', function () {
        assert.deepEqual([
          {
            TYPE: 'FUNCTION_CALL',
            NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: [ { TYPE: 'NUMBER', VALUE: 1 } ]
          }
        ], parse('f(1)'));
      });

      it('should work with several arguments', function () {
        assert.deepEqual([
          {
            TYPE: 'FUNCTION_CALL',
            NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: [ { TYPE: 'NUMBER', VALUE: 1 }, { TYPE: 'STRING', VALUE: 'b' }, { TYPE: 'NUMBER', VALUE: 2 } ]
          }
        ], parse('f(1, "b", 2)'));
      });

      it('should work without arguments', function () {
        assert.deepEqual([
          {
            TYPE: 'FUNCTION_CALL',
            NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: []
          }
        ], parse('f()'));
      });

      it('should work with function calls as arguments', function () {
        assert.deepEqual([
          {
            TYPE: 'FUNCTION_CALL',
            NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: [{
              TYPE: 'FUNCTION_CALL',
              NAME: { TYPE: 'IDENTIFIER', VALUE: 'g' },
              ARGUMENTS: [{TYPE: 'IDENTIFIER', VALUE: 'a'}]
            }]
          }
        ], parse('f(g(a))'));
      });
    });

    describe('If statement', function () {
      it('should work with an expression', function () {
        assert.deepEqual([{
          TYPE: 'IF',
          CONDITION: { TYPE: 'NUMBER', VALUE: 1 },
          BODY: [{ TYPE: 'ASSIGNMENT', LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' }, RHS: { TYPE: 'STRING', VALUE: 'hello' } }]
        }], parse('if 1\na = "hello"\nend'));
      });

      it('should work with a simple binop', function () {
        assert.deepEqual([{
          TYPE: 'IF',
          CONDITION: { TYPE: 'BINARY_OPERATION', OPERATION: 'AND', LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' }, RHS: { TYPE: 'IDENTIFIER', VALUE: 'b' } },
          BODY: [{ TYPE: 'ASSIGNMENT', LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' }, RHS: { TYPE: 'STRING', VALUE: 'hello' } }]
        }], parse('if a and b\na = "hello"\nend'));
      });

      it('should work with a function call and a binop', function () {
        assert.deepEqual([{
          TYPE: 'IF',
          CONDITION: { TYPE: 'BINARY_OPERATION', OPERATION: 'AND', LHS: { TYPE: 'FUNCTION_CALL', NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' }, ARGUMENTS: [{TYPE: 'NUMBER', VALUE: 1}] }, RHS: { TYPE: 'IDENTIFIER', VALUE: 'b' } },
          BODY: [{ TYPE: 'ASSIGNMENT', LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' }, RHS: { TYPE: 'STRING', VALUE: 'hello' } }]
        }], parse('if f(1) and b\na = "hello"\nend'));
      });

      it('should associate and before or', function () {
        var node = parse('if a and b or c\na = "hello"\nend')[0];
        assert.equal(
          node.CONDITION.OPERATION, 'AND'
        );
        assert.equal(
          node.CONDITION.RHS.OPERATION, 'OR'
        );
      });
    });

  });
});

