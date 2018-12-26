import {parseCode} from './code-analyzer';
import {getModel} from './code-analyzer';

var allVariablesDic;
var variableSubs;

var localVariables;
var inputVariables;
var inputVectorVar;

var expresionsDic;
var programObject;

const getSubstitutionModel = (model,inputVector,program) => {
    allVariablesDic= [] ;localVariables =[];inputVariables=[];variableSubs= [] ;expresionsDic= [] ; programObject = null;inputVectorVar=[];
    var progArray = program.split('\n');
    separateModeld(model);
    prepareExpressions();
    prepareVariablesTypes(inputVector,model);
    prepareVariableSubs();
    var subsProg = getSubstitution(prepareNewSubsProgram(model,progArray));
    var colored = colorSubProgram(subsProg);

    return colored;
};

function separateModeld(model) {
    for (var i = 0; i < model.length; i++) {
        if (model[i].type == 'FunctionDeclaration') {
            programObject = {
                from: model[i].line, to: model[i].endLine, type: model[i].type, index: i};}
        else if (model[i].type == 'IfStatement' || model[i].type == 'ElseIfStatement') {
            expresionsDic.push({
                from: model[i].line, to:  model[i].endLine, type: model[i].type, index: i});}
        else {
            contseparateModeld(model,i);
        }}
}

function contseparateModeld(model,i) {
    if(model[i].type == 'WhileStatement'||model[i].type == 'ElseStatment') {
        expresionsDic.push({
            from: model[i].line, to:  model[i].endLine, type: model[i].type, index: i});}
    else if (model[i].type == 'VariableDeclarator' || model[i].type == 'AssignmentExpression') {
        checkAndAdd(model,i);
    }
}

function checkAndAdd(model,i) {
    if(model[i].value!='') {
        allVariablesDic.push({
            from: model[i].line, to: model[i].endLine, type: model[i].type,variable: model[i].name, value: model[i].value});}
}

function prepareInputVector(inputVector) {
    var array = inputVector.split(',');
    for (var i = 0; i < array.length; i++) {
        if(array[i].startsWith('[')) {
            var list =[];
            list.push(array[i].substring(1, array[i].length)); i++;
            while(!array[i].endsWith(']') && i<array.length) {
                list.push(array[i]);
                i++;}
            list.push(array[i].substring(0, array[i].length- 1));
            inputVectorVar.push(list);}
        else {
            contprepareInputVector(inputVector,i,array);
        }
    }
}

function contprepareInputVector(inputVector,i,array) {
    if(array[i].startsWith('\'') || array[i].startsWith('"')) {
        var mystring ='';
        while(!array[i].endsWith('\'') && !array[i].endsWith('"')) {
            mystring = mystring+array[i]+',';
            i++;}
        mystring = mystring+array[i];
        inputVectorVar.push(mystring);}
    else{inputVectorVar.push(array[i]);}
}

function prepareVariablesTypes(inputVector,model) {
    prepareInputVector(inputVector); var index =0;
    for (var i = 0; i < model.length; i++) {
        if (model[i].type == 'VariableDeclarator') {
            index = handleVariableDeclarator(model,i,index);
        }}
}

function handleVariableDeclarator(model,i,index) {
    if(model[i].line == programObject.from && model[i].endLine == programObject.to) {
        pushtoInputVariables(model[i],index);
        index++;}
    else if(model[i].value!='') {
        pushTolocalVariables(model[i]);}

    return index;
}

function pushtoInputVariables(variable,index){
    if (Array.isArray(inputVectorVar[index])) {
        for (var i = 0; i < inputVectorVar[index].length; i++) {
            inputVariables.push({
                from: variable.line, to:  variable.endLine, variable: variable.name+'[' + i + ']', value: inputVectorVar[index][i]});
        }}
    else {
        inputVariables.push({
            from: variable.line, to:  variable.endLine, variable: variable.name, value: inputVectorVar[index]});  }
}

function pushTolocalVariables(variable) {
    if (Array.isArray(variable.value)) {
        for (var i = 0; i < variable.value.length; i++) {
            localVariables.push(variable.name + '[' + i + ']');
        }
        localVariables.push(variable.name);
    }
    else {
        localVariables.push(variable.name);
    }
}

function prepareVariableSubs() {
    for (var i = 0; i < allVariablesDic.length; i++)
    {
        let nearestObj = findNearestExpression(allVariablesDic[i]);
        if(allVariablesDic[i].from>nearestObj.from && allVariablesDic[i].to <nearestObj.to) {
            pushToVariableSubs(allVariablesDic[i].from, nearestObj.to, allVariablesDic[i].type, allVariablesDic[i].variable, allVariablesDic[i].value);
        }else {
            pushToVariableSubs(nearestObj.from,nearestObj.to,allVariablesDic[i].type,allVariablesDic[i].variable,allVariablesDic[i].value);
        }
    }
    variableSubs.sort(compare);
}

function compare(a,b) {
    if (a.from < b.from)
        return -1;
    if (a.from > b.from)
        return 1;
}

function pushToVariableSubs(from,to,type,variable,value) {
    if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            variableSubs.push({
                from: from, to: to, type: type, variable: variable+'['+i+']', value: value[i]});}
    }
    else {
        variableSubs.push({
            from: from, to: to, type: type, variable: variable, value: value
        });
    }
}

function prepareExpressions() {
    for (var i = 0; i < expresionsDic.length; i++)
    {
        if((i+1)<expresionsDic.length)
        {
            if(expresionsDic[i].type != 'WhileStatement' && expresionsDic[i].to == expresionsDic[i+1].to)
            {
                expresionsDic[i].to = expresionsDic[i+1].from-1;
            }
        }
    }
}

function findNearestExpression(varObject) {
    var distance = 10000;
    var nearestObj = null;
    for (var i = 0; i < expresionsDic.length; i++) {
        if( oneCheck(varObject,i) && distance > (varObject.from-expresionsDic[i].from ))
        {
            distance = varObject.from - expresionsDic[i].from;
            nearestObj = expresionsDic[i];
        }}
    if(distance == 10000)
    {
        nearestObj = programObject;
    }
    return nearestObj;
}

function oneCheck(varObject,i) {
    return (varObject.from >= expresionsDic[i].from &&  varObject.from <= expresionsDic[i].to);
}

function prepareNewSubsProgram(model,progArray) {
    var newProg = [];
    for(var i = 0; i < progArray.length; i++) {
        if(i+1==programObject.from) {
            newProg.push({
                index:i+1,line: progArray[i],color:0,type:programObject.type});}
        else if(i+1>programObject.from && i+1<=programObject.to) {
            var keep = true;
            var thisType = null;
            var ans = checkIfKeep(keep,thisType,i,model);
            keep = ans[0];
            thisType = ans[1];
            newProg = addIfTrue(keep,thisType,i,model,progArray,newProg);
        }}
    return newProg;
}

function addIfTrue(keep,thisType,i,model,progArray,newProg) {
    if(keep) {
        newProg.push({
            index:i+1,line: progArray[i],color:0,type:thisType});}
    return newProg;
}

function checkIfKeep(keep,thisType,i,model) {
    for (var j = 0; j < model.length && keep; j++) {
        if(i+1 == model[j].line){
            if(localVariables.includes(model[j].name)){
                keep = false;}
            else {
                thisType = model[j].type;}}}
    return [keep,thisType];
}

function getSubstitution(newProg) {

    for (var i = 0; i < newProg.length; i++) {

        for (var j = variableSubs.length - 1; j >= 0; j--) {

            if(newProg[i].index>variableSubs[j].from && newProg[i].index<=variableSubs[j].to)
            {
                newProg[i].line = newProg[i].line.replaceAll(variableSubs[j].variable,variableSubs[j].value);
            }
        }
    }
    return newProg;
}

function colorSubProgram(SubsProg) {
    var codeToParse ='';
    for (var k = 0; k < SubsProg.length; k++) {
        codeToParse = codeToParse+SubsProg[k].line+'\n';
    }
    parseCode(codeToParse);
    let model = getModel();
    for (var i = 0; i < model.length; i++) {
        if(oneCheckForcolorSubProgram(model,i)) {

            SubsProg = helperFunction(model,i,SubsProg);

        }}
    return SubsProg;
}

function helperFunction(model,i,SubsProg) {
    for (var j = inputVariables.length - 1; j >= 0; j--) {
        model[i].condition = model[i].condition.replaceAll(inputVariables[j].variable, inputVariables[j].value);
    }
    var assignment = eval(model[i].condition);
    if (assignment == true) {
        SubsProg[model[i].line - 1].color = 1;
    }
    else {
        SubsProg[model[i].line - 1].color = 2;
    }
    return SubsProg;
}

function oneCheckForcolorSubProgram(model,i) {
    return (model[i].type == 'IfStatement' || model[i].type == 'ElseIfStatement');
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    let regex = new RegExp('[^\\d\\w](' + search.replace('[', '\\[').replace(']', '\\]') + ')[^\\d\\w]', 'g');
    return target.replace(regex, function (x) {
        return x.replace(search, replacement);
    });
};

export {getSubstitutionModel};
