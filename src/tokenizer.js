'use strict';

/* A token used by the tokenizer */
function Token(name, regex, filter) {
    this.name = name;
    this.regex = regex;
    this.filter = filter;

    // the length of the string this token consumes of the input string
    // this is not the same as this.text.length as it applies to the match
    // of the regular expression, the text can be filtered using this.filter
    // thus changing the actual length of the match
    this.length = 0;

    // the matched text of this token once isMatched is called, with filter
    // applied if defined
    this.text = '';

    // checks whether an string matches this token 
    this.isMatch = function (str) {
        var match = str.match(this.regex);

        if(match) {
            this.text = this.filter ? this.filter(match[0]) : match[0];
            this.length = match[0].length;
            return true;
        }

        return false;
    };

    // returns a plain javascript object representation of
    // this token
    this.plain = function () {
        return {
            'NAME': this.name,
            'VALUE': this.text
        };
    };
}

/* Tokenizer object constructor */
function Tokenizer() {
    this.tokens = [
        // keywords...
        new Token('WHILE', '^while'),
        new Token('IF', '^if'),
        new Token('END', '^end'),
        new Token('TRUE', '^true'),
        new Token('FALSE', '^false'),
        // parentheses
        new Token('PARENS_OPEN', '^\\('),
        new Token('PARENS_CLOSE', '^\\)'),
        // a string
        new Token('STRING', '^"(?:[^\\"]|\\.)*"', function (str) {
            return str.substr(1, str.length - 2);
        }),
        // an identifier
        new Token('IDENTIFIER', '^[a-zA-Z][a-zA-Z0-9_]*'),
        // a comparison equal
        new Token('EQUALEQUAL', '^=='),
        // an equal
        new Token('EQUAL', '^='),
        // a new line
        new Token('NEWLINE', '^\n'),
    ];

    // these tokens are matched but are not added to our output
    this.ignoredTokens = [
        new Token('SPACE', '^ '),
        new Token('TAB', '^\t'),
        new Token('RETURN', '^\r'),
        // a single line comment
        new Token('COMMENT', '^#[^\n]*'),
    ];
}

Tokenizer.prototype.tokenize = function (input) {
    var start = 0,
        length = input.length,
        output = [];

    while(start < length) {
        var str = input.substr(start),
            matched = false;

        // for each token defined create a regular expression for the token
        for(var idx in this.tokens) {
            var token = this.tokens[idx];
            if(token.isMatch(str)) {
                output.push(token.plain());
                start += token.length;

                // turn on the matched flag
                matched = true;

                // we already found the token! stop trying
                break;
            }
        }

        // we didn't match any token... try the ignored ones
        if(!matched) {
            for(idx in this.ignoredTokens) {
                var ignoredToken = this.ignoredTokens[idx];
                if(ignoredToken.isMatch(str)) {
                    start += ignoredToken.length;
                    matched = true;
                    break;
                }
            }
        }

        // we still haven't matched any? it's an error!
        if(!matched) {
            throw 'Could not match token for input ' + str;
        }
    }

    return output;
};

module.exports = Tokenizer;
