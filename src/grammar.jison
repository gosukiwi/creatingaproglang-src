/* lexical grammar */
%lex

%%

/* Keywords */
"def"                   return 'DEF';
"end"                   return 'END';
"if"                    return 'IF';
"else"                  return 'ELSE';
"&&"                    return 'AND';
"and"                   return 'AND';
"||"                    return 'OR';
"or"                    return 'OR';
"+"                     return 'PLUS';
"-"                     return 'MINUS';
"*"                     return 'TIMES';
"/"                     return 'DIV';

/* Literals */
" "+                    /* skip whitespace */
\d+(\.\d+)?             return 'NUMBER';
[a-zA-Z][a-zA-Z0-9_]*   return 'IDENTIFIER';
\"(?:[^\"]|\.)*\"       return 'STRING';
","                     return 'COMMA';
"("                     return 'PARENS_OPEN';
")"                     return 'PARENS_CLOSE';
"="                     return 'EQ';
\n+                     return 'NEWLINE';
<<EOF>>                 return 'EOF';

/lex

%left AND
%left OR

%left MINUS PLUS
%left DIV TIMES

%start Program

%%

OptionalNewline
    : /* empty */
    | NEWLINE
    ;

Program
    : StatementList EOF
        { return $1 }
    ;

StatementList
    : Statement OptionalNewline StatementList
        { $$ = $1.concat([$2]); }
    | Statement OptionalNewline
        { $$ = [$1]; }
    ;

Statement
    : FunctionDefinition
        { $$ = $1; }
    | FunctionCall
        { $$ = $1; }
    | If
        { $$ = $1; }
    | Assignment
        { $$ = $1; }
    ;

/* Rules that can be both an statement and an expression                    */
/* ------------------------------------------------------------------------ */

FunctionCall
    : LHS PARENS_OPEN CallArgumentList PARENS_CLOSE
        { $$ = { TYPE: 'FUNCTION_CALL', NAME: $1, ARGUMENTS: $3 }; }
    ;

/* Statements                                                               */
/* ------------------------------------------------------------------------ */

OptionalStatementList
    : /* nothing */
        { $$ = []; }
    | StatementList
        { $$ = $1; }
    ;

FunctionDefinition
    : DEF IDENTIFIER PARENS_OPEN DefinitionArgumentList PARENS_CLOSE NEWLINE OptionalStatementList END
        { $$ = { TYPE: 'FUNCTION_DEFINITION', NAME: $2, ARGUMENTS: $4, BODY: $7 }; }
    ;

DefinitionArgumentList
    : /* empty */
        { $$ = []; }
    | DefinitionPopulatedArgumentList
        { $$ = $1; }
    ;

DefinitionPopulatedArgumentList
    : Identifier
        { $$ = [$1]; }
    | Identifier COMMA DefinitionPopulatedArgumentList
        { $$ = [$1].concat($3); }
    ;

CallArgumentList
    : /* empty */
        { $$ = []; }
    | CallPopulatedArgumentList
        { $$ = $1; }
    ;

CallPopulatedArgumentList
    : Expression
        { $$ = [$1]; }
    | Expression COMMA CallPopulatedArgumentList
        { $$ = [$1].concat($3); }
    ;

Assignment
    : LHS EQ Expression
        { $$ = { TYPE: 'ASSIGNMENT', LHS: $1, RHS: $3 }; }
    ;

If
    : IF Expression NEWLINE OptionalStatementList ELSE If
        { $$ = { TYPE: 'ELSIF', CONDITION: $2, BODY: $4, ELSIF: $6 }; }
    | IF Expression NEWLINE OptionalStatementList ELSE NEWLINE OptionalStatementList END
        { $$ = { TYPE: 'IF', CONDITION: $2, BODY: $4, ELSE: $7 }; }
    | IF Expression NEWLINE OptionalStatementList END
        { $$ = { TYPE: 'IF', CONDITION: $2, BODY: $4 }; }
    ;

/* Expressions                                                              */
/* ------------------------------------------------------------------------ */

BinaryOperation
    : Expression AND Expression
        { $$ = { TYPE: 'BINARY_OPERATION', OPERATION: 'AND', LHS: $1, RHS: $3 }; }
    | Expression OR Expression
        { $$ = { TYPE: 'BINARY_OPERATION', OPERATION: 'OR', LHS: $1, RHS: $3 }; }
    | Expression PLUS Expression
        { $$ = { TYPE: 'BINARY_OPERATION', OPERATION: 'PLUS', LHS: $1, RHS: $3 }; }
    | Expression MINUS Expression
        { $$ = { TYPE: 'BINARY_OPERATION', OPERATION: 'MINUS', LHS: $1, RHS: $3 }; }
    | Expression TIMES Expression
        { $$ = { TYPE: 'BINARY_OPERATION', OPERATION: 'TIMES', LHS: $1, RHS: $3 }; }
    | Expression DIV Expression
        { $$ = { TYPE: 'BINARY_OPERATION', OPERATION: 'DIV', LHS: $1, RHS: $3 }; }
    ;

Expression
    : PARENS_OPEN Expression PARENS_CLOSE
        { $$ = $2; }
    | BinaryOperation
        { $$ = $1; }
    | FunctionCall
        { $$ = $1; }
    | STRING
        { $$ = { TYPE: 'STRING', VALUE: yytext.substr(1, yytext.length - 2) }; }
    | NUMBER
        { $$ = { TYPE: 'NUMBER', VALUE: (+yytext) }; }
    | LHS
        { $$ = $1 }
    ;

/* possible left-hand-side values */
LHS
    : Identifier
        { $$ = $1 }
    ;

Identifier
    : IDENTIFIER
        { $$ = { TYPE: 'IDENTIFIER', VALUE: yytext }; }
    ;
