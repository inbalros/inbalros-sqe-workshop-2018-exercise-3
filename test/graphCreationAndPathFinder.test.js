import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {getModel} from '../src/js/code-analyzer';
import {getSubstitutionModel,findPath,createGraph,Mydot} from '../src/js/graphCreationAndPathFinder';

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

describe('The Graph that was created', () => {
    it('can handle an empty function', () => {
        var codeToParse = 'function foo(x, y, z){\n\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'1,2,3',codeToParse);
        let dot = Mydot(graph);
        assert.equal(
            dot,'digraph {  }');
    });
    it('can handle local vars and function correctly', () => {
        var codeToParse = 'function foo(x, y, z){\n let a = 1; \n let b = a + y; \n let c = 0;\n return a;\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'1,2,3',codeToParse);
        let dot = Mydot(graph);
        assert.equal(
            dot,'digraph { n0 [label=\"-1-\nlet a = 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\nlet b = a + y; \"style = filled fillcolor = green  shape= \"box\" ]\nn2 [label=\"-3-\nlet c = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn3 [label=\"-4-\nreturn a; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\n }');
    });
    it('can handle array in input vector correctly', () => {
        var codeToParse = 'function foo(x, y, z){\n let a = x[1]; \n let b = a + y; \n let c = x[2];\n return c;\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'[1,2,3],2,3',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\nlet a = x[1]; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\nlet b = a + y; \"style = filled fillcolor = green  shape= \"box\" ]\nn2 [label=\"-3-\nlet c = x[2]; \"style = filled fillcolor = green  shape= \"box\" ]\nn3 [label=\"-4-\nreturn c; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\n }');
    });

    it('can handle simple if correctly', () => {
        var codeToParse = 'function foo(x){\n let a = 1; \n if(a>2){ \n a=5 \n }\n return a;}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'2',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\nlet a = 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\na > 2 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn2 [label=\"-3-\na = 5 \" shape= \"box\" ]\nn3 [label=\"-4-\nreturn a; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 [label=\"true\"]\nn1 -> n3 [label=\"false\"]\nn2 -> n3 []\n }');
    });

    it('can handle simple substitution with global var from above ', () => {
        var codeToParse = 'let a = 3;\n function foo(){\n if(a>2){\n if(a*2>7)\n {\n a++; \n }\n a--;\n }\n return a;\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\na > 2 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn1 [label=\"-2-\na * 2 > 7 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn2 [label=\"-3-\na++ \" shape= \"box\" ]\nn3 [label=\"-4-\na-- \"style = filled fillcolor = green  shape= \"box\" ]\nn4 [label=\"-5-\nreturn a; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 [label=\"true\"]\nn0 -> n4 [label=\"false\"]\nn1 -> n2 [label=\"true\"]\nn1 -> n3 [label=\"false\"]\nn2 -> n3 []\nn3 -> n4 []\n }');
    });

    it('can handle simple substitution with global var from under ', () => {
        var codeToParse = 'function foo(){\n if(a>2){\n if(a*2>7)\n {\n a++; \n }\n a--;\n }\n return a;\n}\nlet a = 3;';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\na > 2 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn1 [label=\"-2-\na * 2 > 7 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn2 [label=\"-3-\na++ \" shape= \"box\" ]\nn3 [label=\"-4-\na-- \"style = filled fillcolor = green  shape= \"box\" ]\nn4 [label=\"-5-\nreturn a; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 [label=\"true\"]\nn0 -> n4 [label=\"false\"]\nn1 -> n2 [label=\"true\"]\nn1 -> n3 [label=\"false\"]\nn2 -> n3 []\nn3 -> n4 []\n }');
    });
    it('can handle complex if-and ifElse statements ', () => {
        var codeToParse = 'function foo(x, y, z){ \n let a = x + 1; \n let b = a + y; \n let c = 0;\n if (b < z) { \n c = c + 5; \n } else if (b < z - 2) { \n c = c + x + 5;\n } else { \n c = c + z + 5; \n } \n return c; \n }';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'1,2,3',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\nlet a = x + 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\nlet b = a + y; \"style = filled fillcolor = green  shape= \"box\" ]\nn2 [label=\"-3-\nlet c = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn3 [label=\"-4-\nb < z \"style = filled fillcolor = green  shape= \"diamond\" ]\nn4 [label=\"-5-\nc = c + 5 \" shape= \"box\" ]\nn5 [label=\"-6-\nreturn c; \"style = filled fillcolor = green  shape= \"box\" ]\nn6 [label=\"-7-\nb < z - 2 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn7 [label=\"-8-\nc = c + x + 5 \" shape= \"box\" ]\nn8 [label=\"-9-\nc = c + z + 5 \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label=\"true\"]\nn3 -> n6 [label=\"false\"]\nn4 -> n5 []\nn6 -> n7 [label=\"true\"]\nn6 -> n8 [label=\"false\"]\nn7 -> n5 []\nn8 -> n5 []\n }');
    });
    it('can handle simple while statements ', () => {
        var codeToParse = 'function foo(x, y, z){ \n let a = x + 1; \n let b = a + y; \n let c = 0; \n while (a < z) { \n c = a + b; \n z = c * 2; \n } \n return z; \n }';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'1,2,1',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\nlet a = x + 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\nlet b = a + y; \"style = filled fillcolor = green  shape= \"box\" ]\nn2 [label=\"-3-\nlet c = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn3 [label=\"-4-\na < z \"style = filled fillcolor = green  shape= \"diamond\" ]\nn4 [label=\"-5-\nc = a + b \" shape= \"box\" ]\nn5 [label=\"-6-\nz = c * 2 \" shape= \"box\" ]\nn6 [label=\"-7-\nreturn z; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label=\"true\"]\nn3 -> n6 [label=\"false\"]\nn4 -> n5 []\nn5 -> n3 []\n }');
    });
    it('can handle simple while statements with seperate bloxes of variables ', () => {
        var codeToParse = 'function foo(x, y, z){\n let a = x + 1;\n let b = 0;\n let c = 0;\n a=1;\n a=8;\n while(a>2)\n {\n a--;\n }\n let h = 1;\n return c;\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'1,2,1',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\nlet a = x + 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\nlet b = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn2 [label=\"-3-\nlet c = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn3 [label=\"-4-\na = 1 \"style = filled fillcolor = green  shape= \"box\" ]\nn4 [label=\"-5-\na = 8 \"style = filled fillcolor = green  shape= \"box\" ]\nn5 [label=\"-6-\na > 2 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn6 [label=\"-7-\na-- \"style = filled fillcolor = green  shape= \"box\" ]\nn7 [label=\"-8-\nlet h = 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn8 [label=\"-9-\nreturn c; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 []\nn4 -> n5 []\nn5 -> n6 [label=\"true\"]\nn5 -> n7 [label=\"false\"]\nn6 -> n5 []\nn7 -> n8 []\n }');
    });
    it('can handle simple if statements with seperate bloxes of variables ', () => {
        var codeToParse = 'function foo(x, y, z){\n let a = x + 1;\n let b = 0;\n let c = 0; \n if(a ==2)\n {\n a=9\n }\n c=1;\n let h = 1;\n return c;\n}';
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,'3,2,3',codeToParse);
        let dot = Mydot(graph);
        assert.equal(dot,'digraph { n0 [label=\"-1-\nlet a = x + 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn1 [label=\"-2-\nlet b = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn2 [label=\"-3-\nlet c = 0; \"style = filled fillcolor = green  shape= \"box\" ]\nn3 [label=\"-4-\na == 2 \"style = filled fillcolor = green  shape= \"diamond\" ]\nn4 [label=\"-5-\na = 9 \" shape= \"box\" ]\nn5 [label=\"-6-\nc = 1 \"style = filled fillcolor = green  shape= \"box\" ]\nn6 [label=\"-7-\nlet h = 1; \"style = filled fillcolor = green  shape= \"box\" ]\nn7 [label=\"-8-\nreturn c; \"style = filled fillcolor = green  shape= \"box\" ]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label=\"true\"]\nn3 -> n5 [label=\"false\"]\nn4 -> n5 []\nn5 -> n6 []\nn6 -> n7 []\n }');
    });
});
