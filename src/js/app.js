import Viz from 'viz.js';
import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {getModel} from './code-analyzer';
import {findPath,createGraph,Mydot} from './graphCreationAndPathFinder';
import { Module, render } from 'viz.js/full.render.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#inputVectorPlaceHolder').val();
        parseCode(codeToParse);
        let model = getModel();
        model.sort(compare);
        let graph = createGraph(codeToParse);
        graph = findPath(graph,model,inputVector,codeToParse);
        document.getElementById('graphWrapper').innerHTML = '';
        createGraphiclGraph(Mydot(graph));
    });
});

function compare(a,b) {
    if (a.line < b.line)
        return -1;
    if (a.line > b.line)
        return 1;
}

function createGraphiclGraph(mydot){
    var viz = new Viz({Module,render});
    let wrapper = document.getElementById('graphWrapper');
    viz.renderSVGElement(mydot)
        .then(function(GraphiclGraph) {
            wrapper.append(GraphiclGraph);
        });
}