// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer;
const fs = require("fs");

// var X2J = require('xml2json')
import * as X2J from 'xml2json'
const cytoscape = require('cytoscape')
var edgehandles = require('cytoscape-edgehandles');
edgehandles(cytoscape);
const selectDirBtn = document.getElementById('select-file')
selectDirBtn.addEventListener('click', function (event) {
    ipc.send('open-file-dialog')
})

ipc.on('selected-file', function (event: any, path: string) {
    parseXml(path)
})

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
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

let nCols = 0
let nRows = 0

interface Node {
    // data: object
    inputs: object
    outputs: object
    col: number
    row: number
    receivers: Node[]
}

function parseXml(path: string) {
    let json = X2J.toJson(fs.readFileSync(path));
    const jsObj = JSON.parse(json);
    let elements: { data: any; }[] = []
    let components: Node[] = jsObj.rte.components.component
    let senders = components.filter(c => c.outputs)
    let receivers = components.filter(c => c.inputs)
    // components.filter(c => c.outputs).forEach(sender =>
    //     sender.receivers = components.filter(c => c.inputs).filter(receiver => receiver.inputs.forEach((input: any) => {
    //         sender.outputs.forEach((output: any) => output.type == input.type && receiver !== sender)
    //     }
    //     )))
    console.log(receivers)
    // senders.forEach(function (sender:any) {
    //     sender.receivers = receivers.filter(function (receiver:any) {
    //         receiver.inputs.input.forEach(function (input: any){
    //             sender.outputs.forEach(function (output: any) {
    //                 return output.type == input.type && receiver !== sender
    //             })
    //         })
    //     })
    // })
    console.log(senders[0].outputs)
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

    components.forEach(component => {
        elements.push({ data: component })
    })
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
                    'border-opacity': 0,
                    // 'z-index': 9007199254740992
                }
            },
            {
                selector: '.prospect',
                style: {
                    'background-color': '#505050',
                    // 'background-color': '#507050',
                    'border-color': 'white',
                    'border-opacity': 1,
                    // prospect: true
                },
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
                    'border-width': 1,
                },
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
                    'control-point-distances': function (ele: any) {
                        // console.log(ele.source());
                        let distances = [0, 0]
                        if (ele.target().data('label')) {
                            // console.log(ele);

                            // let ySource = ele.source().position().y;
                            // var yTarget = ele.target().position().y;
                            let dx = ele.target().position().x - ele.source().position().x
                            let dy = ele.target().position().y - ele.source().position().y
                            let dcol = ele.target().data('col') - ele.source().data('col')
                            let distance = (dy / 2) / (dcol + 1 / 1)
                            // if (ySource < yTarget) return [-100, 100]
                            // else return [100, -100]
                            // distances = [dy > 0 ? -100 : 100, dy > 0 ? 100 : -100]
                            distances = [-distance, distance]

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
                    'opacity': 0,
                    // 'display': 'none'
                }
            },
            {
                selector: '.eh-source',
                style: {
                    'background-color': '#505090',
                    'border-color': 'yellow',
                }
            },
            {
                selector: '.eh-preview',
                style: {
                    'border-color': 'orange',
                }
            }
        ],

        layout: {
            name: 'grid',
            rows: nRows,
            cols: nCols,
            position: function (node: any) { return { row: node.data('row'), col: node.data('col') }; }
        },
        elements: elements,
        // elements: () => {
        //     let element = {'data': {
        //         'label': 'erik',
        //         'col': 0,
        //         'row': 0
        //     }}
        //     console.log(element);

        //     return [element]
        // }
    });

    let eh = cy.edgehandles({
        hoverDelay: 0,
        handlePosition: 'middle middle',
    })

    cy.ready(function (e: any) {
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

    })

    function getMatchingType(source: any, target: any) {
        let targets = []
        for (let output of source.data('outputs').output) {
            for (let input of target.data('inputs').input) {
                if (output.type == input.type) {
                    targets.push({ 'source': output.name, 'type': output.type.replace('struct ', ''), 'target': input.name })
                }
            }
        }
        return targets
    }
    let color = ['hotpink', 'orchid', 'mediumpurple', 'LightSkyBlue', 'MediumAquaMarine', 'LightSalmon', 'Coral']
    // let color = [hsl(270,60%, 70%)]
    let lastEvent = ''
    cy.on('ehshow ehhide ehstart ehcomplete ehstop ehcancel ehpreviewon ehpreviewoff tapdragout',
        function (event: any, sourceNode: any, targetNode: any, addedEles: any) {
            // console.log(event.type)
            switch (event.type) {
                case 'ehshow':
                    sourceNode.activate()

                    sourceNode.data('receivers').classes('prospect')
                    cy.nodes().filter('.default').style('events', 'no')
                    break

                case 'ehhide':
                    cy.nodes(':active').unactivate()
                    cy.nodes().filter('.prospect').classes('default')
                    cy.nodes().filter('.default').style('events', 'yes')
                    break

                case 'tapdragover':
                    break

                case 'ehstop':
                    eh.hide()
                    break
                case 'tapdragout':
                    if (event.target.hasClass('default')) return
                    if (lastEvent == 'ehstart') return
                    if (lastEvent == 'ehpreviewoff') return
                    // if (lastEvent == 'tapdragout'){// && event.target.hasClass('eh-handle')) {

                    eh.hide()
                    // }
                    break

                case 'cancel':
                    break

                case 'ehstart':
                    break

                case 'ehpreviewon':
                    cy.style().selector('.eh-ghost-edge').style({ visibility: 'hidden' }).update()
                    let edgeLabels = getMatchingType(sourceNode, targetNode)
                    // cy.edges().last().style('target-label', edgeLabels[0]['type'])
                    cy.edges().last().style({ 'target-label': edgeLabels[0]['type'], 'line-color': color[(cy.edges().length - 2) % color.length] })

                    break
                case 'ehcomplete':
                case 'ehpreviewoff':
                    cy.edges().last().style('target-label', '')
                    // cy.style().selector('edge').style('label', '').update()
                    // cy.style().selector('.eh-ghost-edge').style('label', '').update()
                    cy.style().selector('.eh-ghost-edge').style({ visibility: 'visible' }).update()
                    break
            }
            lastEvent = event.type
        }
    )

    var layout = cy.nodes().layout({
        name: 'grid',
        rows: nRows,
        cols: nCols,
        position: function (node: any) { return { row: node.data('row'), col: node.data('col') }; }
    });
    cy.on('resize', function () {
        layout.run()
    });
}

parseXml(__dirname + '/../components.xml')
console.log(document.styleSheets);

