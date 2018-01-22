// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const fs = require("fs");

require('./js/xml2json')
const cytoscape = require('cytoscape')
var edgehandles = require('cytoscape-edgehandles');

edgehandles(cytoscape);
const selectDirBtn = document.getElementById('select-file')
selectDirBtn.addEventListener('click', function (event) {
    ipc.send('open-file-dialog')
})

ipc.on('selected-file', function (event, path) {
    parseXml(path)
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function findChildren(outputs, components, col) {
    let newTypes = []
    let nRows = 0
    for (let output of outputs) {
        // console.log(c.jAttr.name + ' [' + output.jAttr.type + '] -> ')
        for (let c2 of components) {
            if (c2.col || !c2.inputs) {
                continue
            }
            for (let input of c2.inputs[0].input) {
                if (input.jAttr.type == output.jAttr.type) {

                    // console.log('\t' + c2.jAttr.name /*+ input.jAttr.type*/)
                    c2.col = col + 1
                    ++nRows
                    if (c2.outputs) {
                        for (o of c2.outputs[0].output) {
                            newTypes.push(o)
                        }
                    }
                    break
                }
            }
        }
        // findChildren(c2, components)
    }
    if (newTypes.length) {
        l = findChildren(newTypes, components, col + 1)
        if (l > nRows) nRows = l
    }
    // console.log(l)
    return nRows
}

let nCols = 0
let nRows = 0

function parseXml(path) {
    let data = fs.readFileSync(path);
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(data.toString(), "text/xml");
    let jsObj = X2J.parseXml(xmlDoc)
    let components = jsObj[0].rte[0].components[0].component

    for (c of components) {
        if (!c.inputs && !c.outputs) {
            c.col = 0
        }

        if (!c.inputs) {
            if (c.outputs) {
                c.col = 1
                nRows = (findChildren(c.outputs[0].output, components, c.col))
            }
        }
        if (c.col + 1 > nCols) nCols = c.col + 1
    }

    let elements = []
    components.forEach(function (component) {
        component.label = capitalizeFirstLetter(component.jAttr.name).replace(/_/g, ' ')
        elements.push({
            data: component,
        })
    })
    console.log(elements)
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
                }
            },
            {
                selector: ':active',
                style: {
                    'background-color': '#FF5050',
                }
            },
            {
                selector: 'node',
                style: {
                    shape: 'roundrectangle',
                    // 'background-color': '#505050',
                    content: 'data(label)',
                    'text-wrap': 'wrap',
                    'text-max-width': 100,
                    'text-valign': 'center',
                    color: 'white',
                    width: 'label',
                    height: 'label',
                    padding: '10px',
                    'overlay-opacity': 0,
                }
            },
            {
                selector: 'edge',
                style: {
                    color: 'white',
                    'text-outline-color': 'black',
                    'text-outline-width': 1,
                    'width': 2,
                    'line-style': 'solid',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': [10, 50],
                    'control-point-weights': [0.1, 0.7],
                    // 'curve-style': 'segments',
                    // 'segment-distances': '100 20',
                    // 'text-rotation': 'autorotate',
                    // 'label': 'data(label)',
                    // 'source-label': 'data(label)',
                    // 'target-label': 'target',
                    // 'source-text-offset': 50,
                    // 'target-text-offset': 50
                }
            },
            {
                selector: 'edge.unbundled-bezier',
                css: {
                    'curve-style': 'unbundled-bezier'
                }
            },
            {
                selector: '.edgehandles-ghost-edge',
                css: {
                    'line-style': 'dotted',
                }
                // }, {
                //     selector: '.edgehandles-preview',
                //     css: {
                //     }
            }],

        layout: {
            name: 'grid',
            rows: nRows,
            cols: nCols,
            position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
        },
        elements: elements,
    });

    cy.ready(function (e) {
        /* Set receivers */
        cy.filter('node[outputs]').forEach(function (sender) {
            sender.data('receivers', cy.filter('node[inputs]').filter(function (receiver) {
                for (let input of receiver.data('inputs') [0].input) {
                    for (let output of sender.data('outputs') [0].output) {
                        return output.jAttr.type == input.jAttr.type
                    }
                }
            }))
        })
        cy.nodes().classes('default')
    })

    cy.edgehandles({
        // toggleOffOnLeave: true,
        stackOrder: 1,
        hoverDelay: 0,
        handleSize: 300,
        handleColor: 'rgba(32, 45, 255, 0)',
        handlePosition: 'middle middle',
    })

    function getConnections(source, target) {
        targets = []
        for (output of source.data('outputs')[0].output) {
            for (input of target.data('inputs')[0].input) {
                if (output.jAttr.type == input.jAttr.type) {
                    targets.push({ 'source': output.jAttr.name, 'type': output.jAttr.type.replace('struct ', ''), 'target': input.jAttr.name })
                }
            }
        }
        return targets
    }

    
    cy.on('select tapdragover tapdragout cyedgehandles.start cyedgehandles.addpreview cyedgehandles.removepreview cyedgehandles.stop cyedgehandles.cancel cyedgehandles.hoverover cyedgehandles.complete', 'node', function (e, e2, e3) {
        // event = e.type + (e.namespace || '')
        event = (e.namespace || e.type).replace('.', '')
        console.log(e)
        console.log(event)
        switch (event) {
            case 'tapdragover':
            this.data('receivers').activate()
            break
            
            case 'tapdragout':
            if (lastEvent != 'start')
            this.data('receivers').unactivate()
            break
            
            case 'cancel':
            this.data('receivers').unactivate()
            break
            
            case 'start':
            break
            
            case 'addpreview':
            cy.style().selector('.edgehandles-ghost-edge').style({
                visibility: 'hidden'
            }).update()
            edgeLabels = getConnections(this, e.target)
            console.log(edgeLabels)
            // edgeLabels['label'] = 'euenveviowd'
            // cy.style().selector('.edgehandles-preview').style('label', edgeLabels['type']).update()
            cy.style().selector('.edgehandles-preview').style('label', edgeLabels[0]['type']).update()
            break
            
            case 'removepreview':
                cy.style().selector('.edgehandles-ghost-edge').style({
                    visibility: 'visible'
                }).update()
                break
        }
        lastEvent = event
    });


    // });
    // cy.on('cyedgehandles.removepreview', 'node', function (e) {

    //     // cy.style().selector('.edgehandles-ghost-edge').style({
    //     //     visibility: 'visible'
    //     // }).update()
    //     // if (state == 'preview') {
    //     //     for (let target in connectableNodes) {
    //     //         console.log(connectableNodes[target])
    //     //         let connectable = cy.getElementById(connectableNodes[target]['id'])
    //     //         connectable.style('border-width', 0)
    //     //     }
    //     // }
    //     // console.log('HEJ');

    // });

    var layout = cy.nodes().layout({
        name: 'grid',
        rows: nRows,
        cols: nCols,
        position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
    });
    cy.on('resize', function () {
        layout.run()
    });
}

parseXml(__dirname + '/components.xml')
