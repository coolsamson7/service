import { createToken, EmbeddedActionsParser, Lexer } from 'chevrotain';
import { Injectable } from '@angular/core';
import { IToken } from '@chevrotain/types';
import { Format, Placeholder } from './interpolator';

/**
 * @ignore
 */
const True = createToken({name: 'True', pattern: /true/});
/**
 * @ignore
 */
const False = createToken({name: 'False', pattern: /false/});
/**
 * @ignore
 */
const Null = createToken({name: 'Null', pattern: /null/});
/**
 * @ignore
 */
const LCurly = createToken({name: 'LCurly', pattern: /{/});
/**
 * @ignore
 */
const RCurly = createToken({name: 'RCurly', pattern: /}/});
/**
 * @ignore
 */
const LRound = createToken({name: 'LRound', pattern: /\(/});
/**
 * @ignore
 */
const RRound = createToken({name: 'RRound', pattern: /\)/});
/**
 * @ignore
 */
const LSquare = createToken({name: 'LSquare', pattern: /\[/});
/**
 * @ignore
 */
const RSquare = createToken({name: 'RSquare', pattern: /]/});
/**
 * @ignore
 */
const Comma = createToken({name: 'Comma', pattern: /,/});
/**
 * @ignore
 */
const Colon = createToken({name: 'Colon', pattern: /:/});
/**
 * @ignore
 */
const StringLiteral = createToken({
    name: 'StringLiteral',
    pattern: /'(:?[^\\'\n\r]+|\\(:?[bfnrtv'\\/]|u[0-9a-fA-F]{4}))*'/
});
/**
 * @ignore
 */
const NumberLiteral = createToken({
    name: 'NumberLiteral',
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
});
/**
 * @ignore
 */
const WhiteSpace = createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED
});
/**
 * @ignore
 */
const Identifier = createToken({name: 'Identifier', pattern: /[a-zA-Z]\w*/});

/**
 * @ignore
 */
const tokens = [
    WhiteSpace,
    NumberLiteral,
    StringLiteral,
    True,
    False,
    Null,
    Identifier,
    RCurly,
    LCurly,
    LSquare,
    RSquare,
    LRound,
    RRound,
    Comma,
    Colon
];

/**
 * @ignore
 */
const lexer = new Lexer(tokens, {
    // Less position info tracked, reduces verbosity of the playground output.
    //positionTracking: "onlyStart"
});

/**
 * @ignore
 */
class Parser extends EmbeddedActionsParser {
    // instance data

    format? : any;
    placeholder? : any;
    parameter? : any;
    value? : any;

    // constructor

    constructor() {
        super(tokens, {recoveryEnabled: true});

        // value

        let currentPlaceholder : Placeholder;
        let currentFormat : Format;

        const number = (token : IToken) : number => {
            return parseInt(token.image, 10);
        };

        const id = (token : IToken) : string => {
            return token.image;
        };

        const bool = (token : IToken) : boolean => {
            return token.image.length == 4; // "true".length = 4
        };

        const string = (token : IToken) : string => {
            return token.image.substring(1, token.image.length - 1);
        };

        this.RULE('value', () => {
            let value;
            this.OR([
                {ALT: () => (value = number(this.CONSUME(NumberLiteral)))},
                {ALT: () => (value = string(this.CONSUME(StringLiteral)))},
                {ALT: () => (value = bool(this.CONSUME(True)))},
                {ALT: () => (value = bool(this.CONSUME(False)))}
            ]);

            return value;
        });

        // parameter

        this.RULE('parameter', () => {
            const param = id(this.CONSUME(Identifier));
            this.CONSUME(Colon);
            const value = this.SUBRULE(this.value);

            return {param: param, value: value};
        });

        // format

        this.RULE('format', () => {
            currentFormat = {format: id(this.CONSUME(Identifier))};

            this.OPTION(() => {
                this.CONSUME(LRound);

                this.MANY_SEP({
                    SEP: Comma,
                    DEF: () => {
                        if (!currentFormat.parameters) currentFormat.parameters = {};

                        const param = this.SUBRULE(this.parameter);

                        // @ts-ignore
                        currentFormat.parameters[param['param']] = param['value'];
                    }
                });

                this.CONSUME(RRound);
            })


            return currentFormat;
        });

        // placeholder

        this.RULE('placeholder', () => {
            this.CONSUME(LCurly);
            currentPlaceholder = {name: id(this.CONSUME(Identifier))};
            this.OPTION(() => {
                this.CONSUME(Colon);
                currentPlaceholder.format = this.SUBRULE(this.format);
            });
            this.CONSUME(RCurly);

            return currentPlaceholder;
        });

        this.performSelfAnalysis(); // don't delete...
    }
}

/**
 * a parser for placeholders used by the interpolator
 */
@Injectable({providedIn: 'root'})
export class PlaceholderParser {
    // instance data

    parser = new Parser();

    // public

    public parse(input : string) : Placeholder {
        let placeholder : Placeholder;

        const lexerResult = lexer.tokenize(input);

        if (lexerResult.errors.length == 0) {
            this.parser.input = lexerResult.tokens;

            placeholder = this.parser.placeholder();

            if (this.parser.errors.length > 0) {
                console.log(this.parser.errors); //throw new Error("sad sad panda, Parsing errors detected")
            }
        }
        else console.log(lexerResult.errors);

        return placeholder!!;
    }
}
