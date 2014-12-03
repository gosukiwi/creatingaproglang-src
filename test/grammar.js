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

      //it('it should work with function calls', function () {
      //  assert.deepEqual([
      //    {
      //      TYPE: 'ASSIGNMENT',
      //      LHS: { TYPE: 'IDENTIFIER', VALUE: 'a' },
      //      RHS: { TYPE: 'FUNCTION_CALL', NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' }, ARGUMENTS: [{TYPE: 'NUMBER', VALUE: 1}] },
      //    }
      //  ], parse('a = f(1)'));
      //});
    });

    describe('Function calls', function () {
      // not yet implemented
      //it('should work with an argument', function () {
      //  assert.deepEqual([
      //    {
      //      TYPE: 'FUNCTION_CALL',
      //      NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
      //      ARGUMENTS: [ { TYPE: 'NUMBER', VALUE: 1 } ]
      //    }
      //  ], parse('f(1)'));
      //});

      //it('should work with several arguments', function () {
      //  assert.deepEqual([
      //    {
      //      TYPE: 'FUNCTION_CALL',
      //      NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
      //      ARGUMENTS: [ { TYPE: 'NUMBER', VALUE: 1 }, { TYPE: 'STRING', VALUE: 'b' }, { TYPE: 'NUMBER', VALUE: 2 } ]
      //    }
      //  ], parse('f(1, "b", 2)'));
      //});

      it('should work without arguments', function () {
        assert.deepEqual([
          {
            TYPE: 'FUNCTION_CALL',
            NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
            ARGUMENTS: []
          }
        ], parse('f()'));
      });

      //it('should work with function calls as arguments', function () {
      //  assert.deepEqual([
      //    {
      //      TYPE: 'FUNCTION_CALL',
      //      NAME: { TYPE: 'IDENTIFIER', VALUE: 'f' },
      //      ARGUMENTS: [{
      //        TYPE: 'FUNCTION_CALL',
      //        NAME: { TYPE: 'IDENTIFIER', VALUE: 'g' },
      //        ARGUMENTS: [{TYPE: 'IDENTIFIER', VALUE: 'a'}]
      //      }]
      //    }
      //  ], parse('f(g(a))'));
      //});
    });
  });
});

