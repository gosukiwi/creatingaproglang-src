/* global describe, it */
'use strict';

var assert = require('assert'),
    Tokenizer = require('../src/tokenizer.js'),
    tokenizer = new Tokenizer();

describe('Tokenizer', function () {
    it('should tokenize identifiers', function () {
        assert.deepEqual([
            { 'NAME': 'IDENTIFIER', 'VALUE': 'name' },
            { 'NAME': 'EQUAL', 'VALUE': '=' },
            { 'NAME': 'STRING', 'VALUE': 'Mike' }
        ], tokenizer.tokenize('name = "Mike"'));
    });

    it('should tokenize keywords', function () {
        assert.deepEqual([
            { 'NAME': 'IF', 'VALUE': 'if' },
            { 'NAME': 'IDENTIFIER', 'VALUE': 'a' },
            { 'NAME': 'EQUALEQUAL', 'VALUE': '==' },
            { 'NAME': 'IDENTIFIER', 'VALUE': 'b' },
            { 'NAME': 'NEWLINE', 'VALUE': '\n' },
            { 'NAME': 'IDENTIFIER', 'VALUE': 'print' },
            { 'NAME': 'PARENS_OPEN', 'VALUE': '(' },
            { 'NAME': 'STRING', 'VALUE': 'they are equal!' },
            { 'NAME': 'PARENS_CLOSE', 'VALUE': ')' },
            { 'NAME': 'NEWLINE', 'VALUE': '\n' },
            { 'NAME': 'END', 'VALUE': 'end' },
            { 'NAME': 'NEWLINE', 'VALUE': '\n' },
        ], tokenizer.tokenize('if a == b\nprint("they are equal!")\nend\n'));

        assert.deepEqual([
            { 'NAME': 'WHILE', 'VALUE': 'while' },
            { 'NAME': 'TRUE', 'VALUE': 'true' },
            { 'NAME': 'NEWLINE', 'VALUE': '\n' },
            { 'NAME': 'IDENTIFIER', 'VALUE': 'print' },
            { 'NAME': 'PARENS_OPEN', 'VALUE': '(' },
            { 'NAME': 'STRING', 'VALUE': 'HI!' },
            { 'NAME': 'PARENS_CLOSE', 'VALUE': ')' },
            { 'NAME': 'NEWLINE', 'VALUE': '\n' },
            { 'NAME': 'END', 'VALUE': 'end' },
        ], tokenizer.tokenize('while true\nprint("HI!")\nend'));
    });
});
