import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {getModel} from '../src/js/code-analyzer';
import {getSubstitutionModel} from '../src/js/symbolicSubstitution';

function compare(a,b) {
    if (a.line < b.line)
        return -1;
    if (a.line > b.line)
        return 1;
}

describe('The symbolic Substitution parser', () => {
    it('is parsing an empty function correctly', () => {
        var codeToParse = 'function foo(x, y, z){\n\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1,2,3',codeToParse);
        assert.equal(
            subModel.length, 3);
        assert.equal(
            subModel[0].line, 'function foo(x, y, z){' );
        assert.equal(
            subModel[0].color, 0 );
    });

    it('is parsing local vars and function correctly', () => {
        var codeToParse = 'function foo(x, y, z){\n let a = "helo, you"; \n let b = a + y; \n let c = 0;\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1,2,3',codeToParse);
        assert.equal(
            subModel.length, 2);
        assert.equal(
            subModel[0].line, 'function foo(x, y, z){' );
        assert.equal(
            subModel[0].color, 0 );
    });

    it('is parsing array in input vector correctly', () => {
        var codeToParse = 'function foo(x){\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'[1,2,3]',codeToParse);
        assert.equal(
            subModel.length, 2);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
    });

    it('is parsing strings in input vector correctly', () => {
        var codeToParse = 'function foo(x){\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'"hey,you"',codeToParse);
        assert.equal(
            subModel.length, 2);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
    });

    it('is parsing simple if correctly', () => {
        var codeToParse = 'function foo(x){\n let a = 1; \nif(a>2){\n return 2; \n }}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, 'if(1>2){' );
        assert.equal(
            subModel[1].color, 2 );
    });

    it('is parsing simple substitution and if correctly - red', () => {
        var codeToParse = 'function foo(x){\n let a = x+1;\nif(a>2){\n return 2; \n }}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, 'if((x + 1)>2){' );
        assert.equal(
            subModel[1].color, 2 );
    });

    it('is parsing simple substitution and if correctly - green', () => {
        var codeToParse = 'function foo(x){\n let a = x+1;\nif(a>2){\n return 2; \n }}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'5',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, 'if((x + 1)>2){' );
        assert.equal(
            subModel[1].color, 1 );
    });

    it('is parsing simple substitution with global var from above - red', () => {
        var codeToParse = 'let a = x+1;\nfunction foo(x){\nif(a>2){\n return 2; \n }}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, 'if((x + 1)>2){' );
        assert.equal(
            subModel[1].color, 2 );
    });

    it('is parsing simple substitution with global var from under - red', () => {
        var codeToParse = 'function foo(x){\nif(a>2){\n return 2;\n}}\n let a = x+1;';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, 'if((x + 1)>2){' );
        assert.equal(
            subModel[1].color, 2 );
    });

    it('is parsing array as local var - green', () => {
        var codeToParse = 'function foo(x){\nlet a = [1,2,3]\nif(a[2]>1){\nreturn 2;\n}}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[0].line, 'function foo(x){' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, 'if(3>1){' );
        assert.equal(
            subModel[1].color, 1 );
    });

    it('is parsing complex if else statments', () => {
        var codeToParse = 'function foo(x, y, z){ \n let a = x + 1; \n let b = a + y; \n let c = 0; \n if (b < z) { \n c = c + 5; \n return x + y + z + c; \n } else if (b < z * 2) { \n c = c + x + 5; \n return x + y + z + c; \n } else { \n c = c + z + 5; \n return x + y + z + c; \n } \n }'
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1,2,3',codeToParse);
        assert.equal(
            subModel.length, 9);
        assert.equal(
            subModel[0].line, 'function foo(x, y, z){ ' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, ' if (((x + 1) + y) < z) { ' );
        assert.equal(
            subModel[1].color, 2 );
        assert.equal(
            subModel[2].line, ' return x + y + z + (0 + 5); ' );
        assert.equal(
            subModel[2].color, 0 );
        assert.equal(
            subModel[3].line, ' } else if (((x + 1) + y) < z * 2) { ' );
    });

    it('is parsing while statments', () => {
        var codeToParse = 'function foo(x, y, z){ \n let a = x + 1; \n let b = a + y; \n let c = 0; \n while (a < z) { \n c = a + b; \n z = c * 2; \n } \n return z; \n }'
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1,2,3',codeToParse);
        assert.equal(
            subModel.length, 6);
        assert.equal(
            subModel[0].line, 'function foo(x, y, z){ ' );
        assert.equal(
            subModel[0].color, 0 );
        assert.equal(
            subModel[1].line, ' while ((x + 1) < z) { ' );
        assert.equal(
            subModel[1].color, 0 );
        assert.equal(
            subModel[2].line, ' z = ((x + 1) + ((x + 1) + y)) * 2; ' );
        assert.equal(
            subModel[2].color, 0 );
    });

    it('is parsing two seperate ifs statments', () => {
        var codeToParse = 'function foo(x,y){ \n if(x==2) \n { \n if(y==3) \n { \n return 3; \n } \n return 2; \n } \n }'
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'2,3',codeToParse);
        console.log(subModel);
        assert.equal(
            subModel.length, 10);
        assert.equal(
            subModel[1].line, ' if(x==2) ' );
        assert.equal(
            subModel[1].color, 1 );
        assert.equal(
            subModel[3].line, ' if(y==3) ' );
        assert.equal(
            subModel[3].color, 1 );
    });

    it('is parsing if VariableDeclarator with no value correctly', () => {
        var codeToParse = 'function foo(x){\n let a; \nif(x>2){\n return 2; \n }}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'2',codeToParse);
        assert.equal(
            subModel.length, 5);
        assert.equal(
            subModel[1].line, ' let a; ' );
        assert.equal(
            subModel[1].color, 0 );
        assert.equal(
            subModel[2].line, 'if(x>2){' );
        assert.equal(
            subModel[2].color, 2 );
    });

    it('is parsing simple substitution with global var from under - red', () => {
        var codeToParse = 'function foo(x){\n let b = 2; \n if(a>b){\n return 2;\n}}\n let a = x+1;';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let subModel = getSubstitutionModel(model,'1',codeToParse);
        assert.equal(
            subModel.length, 4);
        assert.equal(
            subModel[1].line, ' if((x + 1)>2){' );
        assert.equal(
            subModel[1].color, 2 );
    });

});