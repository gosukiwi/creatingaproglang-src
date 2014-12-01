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

/**
 * Main parser, transforms an array of tokens into an AST.
 */
function Parser(tokens) {
  this.tokens = tokens;
}

Parser.prototype.parse = function () {
  var res = [];
  //while(this.realTokens.length > 0) {
    res.push(this.parseStatement());
  //}
  return res;
};

// Helper methods
// ---------------------------------------------------------------------------

Parser.prototype.pop = function (name) {
  if(name && this.tokens[0].NAME !== name) {
    throw 'Expected ' + name + ', got ' + this.tokens[0].NAME;
  }

  return this.tokens.shift();
};

Parser.prototype.peek = function (name) {
  if(name && this.tokens[0].name !== name) {
    throw 'Expected ' + name + ', got ' + this.tokens[0].NAME;
  }

  return this.tokens[0];
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

// Expression parsing
// ---------------------------------------------------------------------------

/**
 * Parse a list of arguments a function call can have
 */
Parser.prototype.parseCallArgumentList = function () {
  var result = [];
  while(this.peek().NAME !== 'PARENS_CLOSE') {
    result.push(this.parseExpression());
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
  return { NAME: 'FUNCTION_CALL', FUNCTION_NAME: name, ARGUMENTS: args };
};

/**
 * Parses an expression.
 * <function_call>
 * <array_value>
 * <string>
 * <number>
 */
Parser.prototype.parseExpression = function () {
  var token = this.peek();
  switch(token.NAME) {
    case 'IDENTIFIER':
      return this.parseFunctionCall();
    case 'STRING':
      return this.parseString();
    case 'NUMBER':
      return this.parseNumber();
    default:
      throw 'Could not parse expression, invalid token ' + token.NAME;
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
  var num = this.parseExpression();
  return { NAME: 'ASSIGNMENT', LHS: identifier, RHS: num };
};

/**
 * Parses a statement
 */
Parser.prototype.parseStatement = function () {
  var token = this.peek();
  var second = this.tokens[1];
  switch(token.NAME) {
    case 'IDENTIFIER':
      if(second.NAME === 'PARENS_OPEN') {
        return this.parseFunctionCall();
      }
      return this.parseAssign();
    default:
      throw 'Invalid token';
  }
};

module.exports = Parser;