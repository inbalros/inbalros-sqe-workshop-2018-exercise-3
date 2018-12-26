import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {getModel} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        parseCode('');
        let model = getModel();
        assert.equal(
            model.length, 0 );
    });

    it('is parsing a let statement correctly', () => {
        parseCode('let a = 3;');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'VariableDeclarator' );
        assert.equal(
            model[0].name, 'a' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '3' );
    });

    it('is parsing a Assignment Expression correctly', () => {
        parseCode('a = 3;');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'AssignmentExpression' );
        assert.equal(
            model[0].name, 'a' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '3' );
    });

    it('is parsing a Assignment and update Expression correctly', () => {
        parseCode('a += 3;');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'AssignmentExpression' );
        assert.equal(
            model[0].name, 'a' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, 'a+3' );
    });

    it('is parsing a Variable Declarator correctly', () => {
        parseCode('let a;');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'VariableDeclarator' );
        assert.equal(
            model[0].name, 'a' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '' );
    });

    it('is parsing a function and variable correctly', () => {
        parseCode('function binarySearch(X){}');
        let model = getModel();
        assert.equal(
            model.length, 2 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'FunctionDeclaration' );
        assert.equal(
            model[0].name, 'binarySearch' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '' );
        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'VariableDeclarator' );
        assert.equal(
            model[1].name, 'X' );
        assert.equal(
            model[1].condition, '' );
        assert.equal(
            model[1].value, '' );
    });

    it('is parsing a AssignmentExpression with binary correctly', () => {
        parseCode('high = n - 1;');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'AssignmentExpression' );
        assert.equal(
            model[0].name, 'high' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '(n - 1)' );
    });

    it('is parsing a while correctly', () => {
        parseCode(' while (low <= high) {}');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'WhileStatement' );
        assert.equal(
            model[0].name, '' );
        assert.equal(
            model[0].condition, '(low <= high)' );
        assert.equal(
            model[0].value, '' );
    });

    it('is parsing a complex AssignmentExpression correctly', () => {
        parseCode('mid = (low + high)/2;');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'AssignmentExpression' );
        assert.equal(
            model[0].name, 'mid' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '((low + high) / 2)' );
    });

    it('is parsing if and member correctly', () => {
        parseCode('if (X < V[mid]){}else{}');
        let model = getModel();
        assert.equal(
            model.length, 2 );
        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'IfStatement' );
        assert.equal(
            model[1].name, '' );
        assert.equal(
            model[1].condition, '(X < V[mid])' );
        assert.equal(
            model[1].value, '' );
    });

    it('is parsing else if and member correctly', () => {
        parseCode('if (X < V[mid]){} else if (X > V[mid]) {}');
        let model = getModel();
        assert.equal(
            model.length, 2 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'ElseIfStatement' );
        assert.equal(
            model[0].name, '' );
        assert.equal(
            model[0].condition, '(X > V[mid])' );
        assert.equal(
            model[0].value, '' );

        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'IfStatement' );
        assert.equal(
            model[1].name, '' );
        assert.equal(
            model[1].condition, '(X < V[mid])' );
        assert.equal(
            model[1].value, '' );
    });

    it('is parsing else if complicated and member correctly', () => {
        parseCode('let a; if (X < V[mid]){} else if (X > V[mid]) {} let b=7;');
        let model = getModel();
        assert.equal(
            model.length, 4 );

        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'VariableDeclarator' );
        assert.equal(
            model[0].name, 'a' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '' );

        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'ElseIfStatement' );
        assert.equal(
            model[1].name, '' );
        assert.equal(
            model[1].condition, '(X > V[mid])' );
        assert.equal(
            model[1].value, '' );

        assert.equal(
            model[2].line, 1 );
        assert.equal(
            model[2].type, 'IfStatement' );
        assert.equal(
            model[2].name, '' );
        assert.equal(
            model[2].condition, '(X < V[mid])' );
        assert.equal(
            model[2].value, '' );

        assert.equal(
            model[3].line, 1 );
        assert.equal(
            model[3].type, 'VariableDeclarator' );
        assert.equal(
            model[3].name, 'b' );
        assert.equal(
            model[3].condition, '' );
        assert.equal(
            model[3].value, '7' );

    });

    it('is parsing return correctly', () => {
        parseCode('function binarySearch(){return -1;}');
        let model = getModel();
        assert.equal(
            model.length, 2 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'ReturnStatement' );
        assert.equal(
            model[0].name, '' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '-1' );

        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'FunctionDeclaration' );
        assert.equal(
            model[1].name, 'binarySearch' );
        assert.equal(
            model[1].condition, '' );
        assert.equal(
            model[1].value, '' );
    });

    it('is parsing return unary correctly', () => {
        parseCode('function binarySearch(){return 6;}');
        let model = getModel();
        assert.equal(
            model.length, 2 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'ReturnStatement' );
        assert.equal(
            model[0].name, '' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '6' );

        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'FunctionDeclaration' );
        assert.equal(
            model[1].name, 'binarySearch' );
        assert.equal(
            model[1].condition, '' );
        assert.equal(
            model[1].value, '' );
    });

    it('is parsing for correctly', () => {
        parseCode('for(let i=0;i<4;i++){}');
        let model = getModel();
        assert.equal(
            model.length, 3 );

        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'VariableDeclarator' );
        assert.equal(
            model[0].name, 'i' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '0' );

        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'UpdateExpression' );
        assert.equal(
            model[1].name, 'i' );
        assert.equal(
            model[1].condition, '' );
        assert.equal(
            model[1].value, '++' );

        assert.equal(
            model[2].line, 1 );
        assert.equal(
            model[2].type, 'ForStatement' );
        assert.equal(
            model[2].name, '' );
        assert.equal(
            model[2].condition, '(i < 4)' );
        assert.equal(
            model[2].value, '' );
    });

    it('is parsing do while Expression correctly', () => {
        parseCode('do{}while(a<3);');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'DoWhileStatement' );
        assert.equal(
            model[0].name, '' );
        assert.equal(
            model[0].condition, '(a < 3)' );
        assert.equal(
            model[0].value, '' );
    });

    it('is parsing update Expression correctly', () => {
        parseCode('++i');
        let model = getModel();
        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'UpdateExpression' );
        assert.equal(
            model[0].name, 'i' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '++' );
    });

    it('is parsing assignment and update correctly', () => {
        parseCode('a=i++;');
        let model = getModel();

        assert.equal(
            model.length, 2 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'UpdateExpression' );
        assert.equal(
            model[0].name, 'i' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '++' );

        assert.equal(
            model[1].line, 1 );
        assert.equal(
            model[1].type, 'AssignmentExpression' );
        assert.equal(
            model[1].name, 'a' );
        assert.equal(
            model[1].condition, '' );
        assert.equal(
            model[1].value, 'i++' );
    });


    it('is parsing array correctly', () => {
        parseCode('let a = [1,2,3];');
        let model = getModel();

        assert.equal(
            model.length, 1 );
        assert.equal(
            model[0].line, 1 );
        assert.equal(
            model[0].type, 'VariableDeclarator' );
        assert.equal(
            model[0].name, 'a' );
        assert.equal(
            model[0].condition, '' );
        assert.equal(
            model[0].value, '1,2,3' );
    });
});
