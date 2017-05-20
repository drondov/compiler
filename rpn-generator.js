import _ from 'lodash';

const precedenceTable = {
    '@': 10,
    '*': 9,
    '/': 9,
    '+': 8,
    '-': 8,
    '>': 7,
    '<': 7,
    '=': 7,
    '&': 6,
    '|': 5,
    ':=': 4,
    'write': 4,
    'read': 4,
    '(': 3,
    ';': 2,
    '{': 1,
    'if': 1,
    'while': 1
};

function getPrecedence(token) {
    const precedence = precedenceTable[token.text] || precedenceTable[token.lexem.type];
    if (_.isUndefined(precedence)) {
        throw new Error(`Not found operator '${token.text}' in precedence table`);
    }
    return precedence;
}

function top(stack) {
    return stack[stack.length - 1];
}

export default class RPNGenerator {

    constructor() {
        this._labelIndex = 0;
        this.labelStack = [];
    }

    createJump(type, labelToken) {
        if (!['JNE', 'JMP'].includes(type)) {
            throw new Error('Unknown type of jump.');
        }

        return {
            text: `${type}[${labelToken.labelIndex}]`,
            labelIndex: labelToken.labelIndex,
            lexem: {
                type: type
            }
        };
    }

    createLabel() {
        const labelIndex = ++this._labelIndex;
        const token = {
            text: `LABEL[${labelIndex}]`,
            labelIndex,
            lexem: {
                type: 'LABEL'
            }
        };
        return token;
    }

    generate(lexerData) {
        // remove unnecessary tokens. `Program` `IDN` `{` ... `}`
        const tokens = _.cloneDeep(lexerData.tokens);

        tokens.splice(0, 3);
        tokens.splice(-1, 1);

        const stack = [];
        const result = [];
        const steps = [];
        for (let i = 0; i < tokens.length; ++i) {
            const token = tokens[i];
            
            steps.push({
                token: _.cloneDeep(token),
                stack: _.cloneDeep(stack),
                rpn: _.cloneDeep(result),
            });

            if (token.lexem.type === 'NUMBER' || token.lexem.type === 'ID') {
                result.push(token);
                continue;
            }

            if (['(', 'if'].includes(token.text)) {
                stack.push(token);
                continue;
            }

            if (token.text === 'while') {
                stack.push(token);
                const label = this.createLabel();
                this.labelStack.push(label);
                result.push(label);
                continue;
            }

            if (token.text === '{') {
                while (top(stack).text !== 'if' && top(stack).text !== 'while') {
                    result.push(stack.pop());
                }
                stack.push(token);
                const label = this.createLabel();
                this.labelStack.push(label);
                result.push(this.createJump('JNE', label));
                continue;
            }

            if (token.text === '}') {
                while (top(stack).text !== '{') {
                    result.push(stack.pop());
                }
                stack.pop(); // pop left bracket.

                const jneLabel = this.labelStack.pop()

                const keywordToken = stack.pop();
                if (keywordToken.text === 'while') {
                    const jmp = this.createJump('JMP', this.labelStack.pop());

                    result.push(jmp);
                }
                result.push(jneLabel);

                continue;
            }

            if (token.text === ')') {
                while (top(stack).text !== '(') {
                    result.push(stack.pop());
                }
                stack.pop();
                continue;
            }

            if (token.lexem.text === '@') {
                while (stack.length && getPrecedence(top(stack)) > getPrecedence(token)) {
                    result.push(stack.pop());
                }
                stack.push(token);
                continue;
            }

            if (token.lexem.type === 'operator' || ['write', 'read', ';'].includes(token.text)) {
                while (stack.length && getPrecedence(top(stack)) >= getPrecedence(token)) {
                    result.push(stack.pop());
                }
                if (token.lexem.type !== 'delimiter') {
                    stack.push(token);
                }
                continue;
            }

        }
        // pop all elements into `result`.
        result.push(...stack.reverse());

        steps.push({
            stack: _.cloneDeep(stack),
            rpn: _.cloneDeep(result),
        });

        // Making label list.
        const labelList = {};
        for (let i = 0; i < result.length; ++i) {
            const token = result[i];
            if (token.lexem.type === 'LABEL') {
                labelList[token.labelIndex] = i;
                result.splice(i, 1);
            }
        }

        return {
            rpn: result,
            steps,
            labelList,
        };
    }
}
