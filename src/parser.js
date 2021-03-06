/**
 * URYB parser. It transforms a list of tokens into an AST.
 *
 * Definitions:
 * Atom/Terminal: Somthing which is a value itself
 * Example: 1, "a string"
 *
 * Expression: Right hand side of an assignment
 * Example: 1, "string", function_call(), array[1], mixed()[1]
 *
 * Statement: An instruction to be executed
 * Example: if, while, for, a = 2
 *
 * Syntax:
 * a = 1
 * if a > 2
 *   do_something()
 * end
 *
 * @author Federico Ramirez
 * @licence MIT
 */

'use strict';

// Generic helpers
// ---------------------------------------------------------------------------

/**
 * Extend strings to support the _inside_ method. This method returns true if
 * the string is inside of an array.
 *
 * "apple".inside(["orange", "banana", "apple"]); // true
 */
String.prototype.inside = function(arr) {
  var self = this;
  var result = false;
  arr.some(function (item) {
    if(self === item) {
      result = true;
      return true;
    }

    return false;
  });

  return result;
};

// Parser
// ---------------------------------------------------------------------------

/**
 * Main parser, transforms an array of tokens into an AST.
 */
function Parser(tokens) {
  this.tokens = tokens;
}

Parser.prototype.parse = function () {
  var res = [];
  while(this.tokens.length > 0) {
    res.push(this.parseStatement());
  }
  return res;
};

// Helper methods
// ---------------------------------------------------------------------------

/**
 * Removes the first token from the array and returns it.
 */
Parser.prototype.pop = function (name) {
  if(name && this.tokens[0].NAME !== name) {
    throw 'Expected ' + name + ', got ' + this.tokens[0].NAME;
  }

  return this.tokens.shift();
};

/**
 * Takes a peek at the tokens array and returns the first one without removing
 * it.
 */
Parser.prototype.peek = function (name) {
  if(name && this.tokens[0].name !== name) {
    throw 'Expected ' + name + ', got ' + this.tokens[0].NAME;
  }

  return this.tokens[0];
};

/**
 * Consumes new lines if there
 */
Parser.prototype.consumeNewlines = function () {
  var token = this.peek();
  while(token && token.NAME === 'NEWLINE') {
    this.pop();
    token = this.peek();
  }
};

// Atom parsing
// ---------------------------------------------------------------------------

Parser.prototype.parseString = function () {
  var result = this.pop('STRING');
  return result;
};

Parser.prototype.parseNumber = function () {
  var result = this.pop('NUMBER');
  return result;
};

Parser.prototype.parseIdentifier = function () {
  var result = this.pop('IDENTIFIER');
  return result;
};

// Expression parsing
// ---------------------------------------------------------------------------

/**
 * Parse a list of arguments a function call can have
 * <expression> <comma> <expression> [...]
 */
Parser.prototype.parseCallArgumentList = function () {
  var result = [];
  while(this.peek().NAME !== 'PARENS_CLOSE') {
    result.push(this.parseExpression());
    // Are we done yet? no? Consume a comma and wait for more arguments
    if(this.peek().NAME !== 'PARENS_CLOSE') {
      this.pop('COMMA');
    }
  }
  return result;
};

/**
 * Parse a function call.
 * <t:identifier>(<argument_list>)<t:newline>
 */
Parser.prototype.parseFunctionCall = function () {
  var name = this.pop('IDENTIFIER');
  this.pop('PARENS_OPEN');
  var args = this.parseCallArgumentList();
  this.pop('PARENS_CLOSE');
  this.consumeNewlines();
  return { NAME: 'FUNCTION_CALL', FUNCTION_NAME: name, ARGUMENTS: args };
};

Parser.prototype.paseBinaryOperation = function () {
  var lhs = this.parseIdentifier();
  var operation = this.pop().NAME;
  var rhs = this.parseExpression();
  return { NAME: 'BINARY_OPERATION', OPERATION: operation, LHS: lhs, RHS: rhs };
};

/**
 * Parses an expression.
 * <function_call>
 * <array_value>
 * <string>
 * <number>
 */
Parser.prototype.parseExpression = function () {
  var first  = this.peek();
  var second = this.tokens[1];
  switch(first.NAME) {
    case 'IDENTIFIER':
      if(second.NAME === 'PARENS_OPEN') {
        return this.parseFunctionCall();
      } else if(second.NAME.inside(['AND', 'OR'])) {
        return this.paseBinaryOperation();
      }
      return this.parseIdentifier();
    case 'STRING':
      return this.parseString();
    case 'NUMBER':
      return this.parseNumber();
    default:
      throw 'Could not parse expression, invalid token ' + first.NAME;
  }
};

// Statements
// ---------------------------------------------------------------------------

/**
 * Parse assignment.
 * <t:identifier> <t:equal> <expression>
 */
Parser.prototype.parseAssign = function () {
  var identifier = this.pop('IDENTIFIER');
  this.pop('EQUAL');
  var exp = this.parseExpression();
  this.consumeNewlines();
  return { NAME: 'ASSIGNMENT', LHS: identifier, RHS: exp };
};

/**
 * Parses an IF statement.
 * <if> <expression> <newline>* <statement>* <end>
 */
Parser.prototype.parseIf = function () {
  this.pop('IF');
  var condition = this.parseExpression();
  this.consumeNewlines();
  // Block of statements to be executed
  var block = [];
  // We could have an empty if, so peek for statements
  while(this.peek().NAME !== 'END') {
    block.push(this.parseStatement());
  }
  this.pop('END');
  this.consumeNewlines();
  return { NAME: 'IF', CONDITION: condition, BLOCK: block };
};

/**
 * Parses a statement
 */
Parser.prototype.parseStatement = function () {
  var first  = this.peek();
  var second = this.tokens[1];
  switch(first.NAME) {
    case 'IDENTIFIER':
      if(second.NAME === 'PARENS_OPEN') {
        return this.parseFunctionCall();
      }
      return this.parseAssign();
    case 'IF':
      return this.parseIf();
    default:
      throw 'Invalid token';
  }
};

module.exports = Parser;
