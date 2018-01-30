"use strict";
exports.__esModule = true;
// All of the Node.js APIs are available in this process.
var ipc = require('electron').ipcRenderer;
var fs = require("fs");
// var X2J = require('xml2json')
var X2J = require("xml2json");
var cytoscape = require('cytoscape');
var edgehandles = require('cytoscape-edgehandles');
edgehandles(cytoscape);
var selectDirBtn = document.getElementById('select-file');
selectDirBtn.addEventListener('click', function (event) {
    ipc.send('open-file-dialog');
});
ipc.on('selected-file', function (event, path) {
    parseXml(path);
});
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
// function findChildren(outputs: any, components: any, col: number) {
//     let newTypes = []
//     let nRows = 0
//     for (let output of outputs) {
//         for (let c2 of components) {
//             if (c2.col || !c2.inputs) {
//                 continue
//             }
//             for (let input of c2.inputs.input) {
//                 if (input.type == output.type) {
//                     c2.col = col + 1
//                     ++nRows
//                     if (c2.outputs) {
//                         for (let o of c2.outputs.output) {
//                             newTypes.push(o)
//                         }
//                     }
//                     break
//                 }
//             }
//         }
//     }
//     if (newTypes.length) {
//         let l = findChildren(newTypes, components, col + 1)
//         if (l > nRows) nRows = l
//     }
//     return nRows
// }
var nCols = 0;
var nRows = 0;
function parseXml(path) {
    var json = X2J.toJson(fs.readFileSync(path));
    var jsObj = JSON.parse(json);
    var elements = [];
    var components = jsObj.rte.components.component;
    var senders = components.filter(function (c) { return c.outputs; });
    var receivers = components.filter(function (c) { return c.inputs; });
    // components.filter(c => c.outputs).forEach(sender =>
    //     sender.receivers = components.filter(c => c.inputs).filter(receiver => receiver.inputs.forEach((input: any) => {
    //         sender.outputs.forEach((output: any) => output.type == input.type && receiver !== sender)
    //     }
    //     )))
    console.log(receivers);
    // senders.forEach(function (sender:any) {
    //     sender.receivers = receivers.filter(function (receiver:any) {
    //         receiver.inputs.input.forEach(function (input: any){
    //             sender.outputs.forEach(function (output: any) {
    //                 return output.type == input.type && receiver !== sender
    //             })
    //         })
    //     })
    // })
    console.log(senders[0].outputs);
    // senders.forEach(sender => sender.receivers = receivers.filter(receiver => receiver.inputs..forEach((input: any) => {
    //         sender.outputs.forEach((output: any) => output.type == input.type && receiver !== sender)
    //     }
    //     )))
    // elements[0].data.receivers = components.filter(f => !f.inputs && f.outputs)
    // TODO: https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
    // components[0].label = 'erik'
    // console.log(components)
    // components.filter(f => !f.inputs && !f.outputs).forEach(c => c.col = 0)
    // console.log(components.filter(f => !f.inputs && !f.outputs));
    // console.log(components.filter(f => !f.inputs && f.outputs));
    components.forEach(function (component) {
        elements.push({ data: component });
    });
    // for (let c of components) {
    //     let col = 0
    //     // if (!c.inputs && !c.outputs) {
    //     //     c.col = 0
    //     // }
    //     if (!c.inputs) {
    //         if (c.outputs) {
    //             col = 1
    //             nRows = (findChildren(c.outputs.output, components, col))
    //         }
    //     }
    //     if (col + 1 > nCols) nCols = col + 1
    //     let data = c
    //     c.label = capitalizeFirstLetter(c.name).replace(/_/g, ' ')
    //     c.col = col
    //     c.row = 0
    //     elements.push({
    //                 data: c, 
    //                 // data{'col'}: col,
    //             })
    // }
    // components.forEach(function (component : any) {
    //     component.label = capitalizeFirstLetter(component.name).replace(/_/g, ' ')
    //     component.prospect = false
    // elements.push({
    //         data: component,
    //     })
    // })
    // console.log('elements', elements)
    // cy.filter('node[outputs]').forEach(function (sender: any) {
    //     sender.data('receivers', cy.filter('node[inputs]').filter(function (receiver: any) {
    //         for (let input of receiver.data('inputs').input) {
    //             for (let output of sender.data('outputs').output) {
    //                 return output.type == input.type && receiver !== sender
    //             }
    //         }
    //     }))
    // })
    // cy.nodes().classes('default')
    var cy = cytoscape({
        container: document.getElementById('cy'),
        boxSelectionEnabled: false,
        // autounselectify: true,
        userZoomingEnabled: false,
        userPanningEnabled: false,
        autoungrabify: true,
        style: [
            {
                selector: '.default',
                style: {
                    'background-color': '#505050',
                    'border-opacity': 0
                }
            },
            {
                selector: '.prospect',
                style: {
                    'background-color': '#505050',
                    // 'background-color': '#507050',
                    'border-color': 'white',
                    'border-opacity': 1
                }
            },
            {
                selector: ':active',
                style: {
                    // 'background-color': '#FF5050',
                    // 'border-width': 2
                    'border-opacity': 1,
                    'border-color': 'orange'
                }
            },
            {
                selector: 'node',
                style: {
                    shape: 'roundrectangle',
                    // opacity: 0.9,
                    // 'background-color': '#505050',
                    content: 'data(label)',
                    'text-wrap': 'wrap',
                    'text-max-width': 100,
                    'text-valign': 'center',
                    'font-size': 12,
                    color: 'white',
                    width: 'label',
                    height: 'label',
                    padding: '8px',
                    'overlay-opacity': 0,
                    'border-width': 1
                }
            },
            {
                selector: 'edge',
                style: {
                    color: 'white',
                    'font-size': 12,
                    // 'text-outline-color': 'black',
                    // 'text-outline-width': 1,
                    'width': 1,
                    'line-style': 'solid',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'unbundled-bezier',
                    // 'control-point-distances': [-100, 100],
                    'control-point-weights': [0.1, 0.9],
                    'text-rotation': 'autorotate',
                    'control-point-distances': function (ele) {
                        // console.log(ele.source());
                        var distances = [0, 0];
                        if (ele.target().data('label')) {
                            // console.log(ele);
                            // let ySource = ele.source().position().y;
                            // var yTarget = ele.target().position().y;
                            var dx = ele.target().position().x - ele.source().position().x;
                            var dy = ele.target().position().y - ele.source().position().y;
                            var dcol = ele.target().data('col') - ele.source().data('col');
                            var distance = (dy / 2) / (dcol + 1 / 1);
                            // if (ySource < yTarget) return [-100, 100]
                            // else return [100, -100]
                            // distances = [dy > 0 ? -100 : 100, dy > 0 ? 100 : -100]
                            distances = [-distance, distance];
                            // var str = '' + Math.abs(pos2 - pos1) + 'px -' + Math.abs(pos2 - pos1) + 'px';
                            // console.log(pos1, pos2, str);
                        }
                        return distances;
                    },
                    // 'z-index': 9007199254740992
                    // 'label': 'data(label)',
                    // 'label': 'hej',
                    // 'source-label': 'data(label)',
                    // 'target-label': 'target',
                    // 'source-text-offset': 50,
                    'target-text-offset': 50,
                    'target-text-margin-y': -10
                }
            },
            // {
            //     selector: '.eh-ghost-edge',
            //     style: {
            //         'line-style': 'dotted',
            //     }
            // },
            {
                selector: '.eh-handle',
                style: {
                    width: 100,
                    height: 50,
                    // 'z-index': 1
                    // 'events': ['tapdragover', 'no'],
                    // 'background-color': '#FF5050',
                    'opacity': 0
                }
            },
            {
                selector: '.eh-source',
                style: {
                    'background-color': '#505090',
                    'border-color': 'yellow'
                }
            },
            {
                selector: '.eh-preview',
                style: {
                    'border-color': 'orange'
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: nRows,
            cols: nCols,
            position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
        },
        elements: elements
    });
    var eh = cy.edgehandles({
        hoverDelay: 0,
        handlePosition: 'middle middle'
    });
    cy.ready(function (e) {
        /* Set receivers */
        // cy.filter('node[outputs]').forEach(function (sender: any) {
        //     sender.data('receivers', cy.filter('node[inputs]').filter(function (receiver: any) {
        //         for (let input of receiver.data('inputs').input) {
        //             for (let output of sender.data('outputs').output) {
        //                 return output.type == input.type && receiver !== sender
        //             }
        //         }
        //     }))
        // })
        // cy.nodes().classes('default')
        console.log(cy.elements());
    });
    function getMatchingType(source, target) {
        var targets = [];
        for (var _i = 0, _a = source.data('outputs').output; _i < _a.length; _i++) {
            var output = _a[_i];
            for (var _b = 0, _c = target.data('inputs').input; _b < _c.length; _b++) {
                var input = _c[_b];
                if (output.type == input.type) {
                    targets.push({ 'source': output.name, 'type': output.type.replace('struct ', ''), 'target': input.name });
                }
            }
        }
        return targets;
    }
    var color = ['hotpink', 'orchid', 'mediumpurple', 'LightSkyBlue', 'MediumAquaMarine', 'LightSalmon', 'Coral'];
    // let color = [hsl(270,60%, 70%)]
    var lastEvent = '';
    cy.on('ehshow ehhide ehstart ehcomplete ehstop ehcancel ehpreviewon ehpreviewoff tapdragout', function (event, sourceNode, targetNode, addedEles) {
        // console.log(event.type)
        switch (event.type) {
            case 'ehshow':
                sourceNode.activate();
                sourceNode.data('receivers').classes('prospect');
                cy.nodes().filter('.default').style('events', 'no');
                break;
            case 'ehhide':
                cy.nodes(':active').unactivate();
                cy.nodes().filter('.prospect').classes('default');
                cy.nodes().filter('.default').style('events', 'yes');
                break;
            case 'tapdragover':
                break;
            case 'ehstop':
                eh.hide();
                break;
            case 'tapdragout':
                if (event.target.hasClass('default'))
                    return;
                if (lastEvent == 'ehstart')
                    return;
                if (lastEvent == 'ehpreviewoff')
                    return;
                // if (lastEvent == 'tapdragout'){// && event.target.hasClass('eh-handle')) {
                eh.hide();
                // }
                break;
            case 'cancel':
                break;
            case 'ehstart':
                break;
            case 'ehpreviewon':
                cy.style().selector('.eh-ghost-edge').style({ visibility: 'hidden' }).update();
                var edgeLabels = getMatchingType(sourceNode, targetNode);
                // cy.edges().last().style('target-label', edgeLabels[0]['type'])
                cy.edges().last().style({ 'target-label': edgeLabels[0]['type'], 'line-color': color[(cy.edges().length - 2) % color.length] });
                break;
            case 'ehcomplete':
            case 'ehpreviewoff':
                cy.edges().last().style('target-label', '');
                // cy.style().selector('edge').style('label', '').update()
                // cy.style().selector('.eh-ghost-edge').style('label', '').update()
                cy.style().selector('.eh-ghost-edge').style({ visibility: 'visible' }).update();
                break;
        }
        lastEvent = event.type;
    });
    var layout = cy.nodes().layout({
        name: 'grid',
        rows: nRows,
        cols: nCols,
        position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
    });
    cy.on('resize', function () {
        layout.run();
    });
}
parseXml(__dirname + '/../components.xml');
console.log(document.styleSheets);
//# sourceMappingURL=renderer.js.map