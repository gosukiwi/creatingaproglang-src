/* lexical grammar */
%lex

%%

/* Keywords */
"def"                   return 'DEF';
"end"                   return 'END';

/* Literals */
" "+                    /* skip whitespace */
\d+(\.\d+)?             return 'NUMBER';
[a-zA-Z][a-zA-Z0-9_]*   return 'IDENTIFIER';
\"(?:[^\"]|\.)*\"       return 'STRING';
","                     return 'COMMA';
"("                     return 'PARENS_OPEN';
")"                     return 'PARENS_CLOSE';
"="                     return 'EQ';
[\n]+                   return 'NEWLINE';

<<EOF>>                 return 'EOF';

/lex

%start Program

%%

Program
    : StatementList EOF
        { return $1 }
    ;

StatementList
    : Statement StatementList
        { $$ = $1.concat([$2]); }
    | Statement
        { $$ = [$1]; }
    ;

Statement
    : FunctionDefinition
        { $$ = $1; }
    | FunctionCall
        { $$ = $1 }
    | Assignment
        { $$ = $1; }
    ;

FunctionDefinition
    : DEF IDENTIFIER PARENS_OPEN DefinitionArgumentList PARENS_CLOSE NEWLINE StatementList NEWLINE END
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

FunctionCall
    : LHS PARENS_OPEN PARENS_CLOSE
        { $$ = { TYPE: 'FUNCTION_CALL', NAME: $1, ARGUMENTS: [] }; }
    ;

Assignment
    : LHS EQ Expression
        { $$ = { TYPE: 'ASSIGNMENT', LHS: $1, RHS: $3 }; }
    ;

/* possible left-hand-side values */
LHS
    : Identifier
        { $$ = $1 }
    ;

/* Expressions */

Expression
    : PARENS_OPEN Expression PARENS_CLOSE
        { $$ = $2; }
    | STRING
        { $$ = { TYPE: 'STRING', VALUE: yytext.substr(1, yytext.length - 2) }; }
    | NUMBER
        { $$ = { TYPE: 'NUMBER', VALUE: (+yytext) }; }
    | Identifier
        { $$ = $1 }
    ;

Identifier
    : IDENTIFIER
        { $$ = { TYPE: 'IDENTIFIER', VALUE: yytext }; }
    ;
