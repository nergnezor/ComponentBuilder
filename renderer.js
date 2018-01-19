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
        component.compatible = []
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
        style: [{
            //     selector: 'core',
            //     css: {
            //         'active-bg-color': 'red',
            //         'selection-box-color': 'red',
            //         'selection-box-border-color': 'red',
            //         'overlay-color': 'red'
            //     }
            // }, {
            selector: ':active',
            css: {
                'overlay-color': '#ff0000',
                // 'overlay-opacity': 0,
                'overlay-padding': 0,
            }
        }, {
            selector: ':selected',
            style: {
                'overlay-color': 'green',
                'overlay-opacity': 0,
                'background-color': '#FF5050',
            }
        }, {
            selector: 'node',
            style: {
                shape: 'roundrectangle',
                'background-color': '#505050',
                content: 'data(label)',
                'text-wrap': 'wrap',
                'text-max-width': 100,
                'text-valign': 'center',
                color: 'white',
                width: 'label',
                height: 'label',
                padding: '10px',
                // 'font-size': '5'
            }
        }, {
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
        }, {
            selector: 'edge.unbundled-bezier',
            css: {
                'curve-style': 'unbundled-bezier'
            }
        }, {
            selector: '.edgehandles-hover',
            css: {
                'background-color': 'purple',
                'border-width': 2,
                'border-color': 'yellow'
            }
            // }, {
            //     selector: '.edgehandles-source',
            //     css: {
            //         'border-width': 2,
            //         'border-color': 'yellow'
            //     }
            // }, {
            //     selector: '.edgehandles-target',
            //     css: {
            //         'border-width': 2,
            //         'border-color': 'cyan'
            //     }
            // }, {
            //     selector: '.edgehandles-presumptive-target',
            //     css: {
            //         'line-color': 'blue',
            //         'target-arrow-color': 'blue',
            //         'source-arrow-color': 'green'
            //     }
        }, {
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

    function SetChildren() {
        let senders = cy.filter('node[outputs]')
        let receivers = cy.filter('node[inputs]')
        // console.log(receivers);
        // receivers.forEach(function (receiver) {
        //     for (let input of receiver.data('inputs') [0].input) {
        //         senders.forEach(function (sender) {
        //             for (let output of sender.data('outputs') [0].output) {
        //                 if (output.jAttr.type == input.jAttr.type) {
        //                     sender.data('compatible').push(receiver)
        //                     return
        //                 }
        //             }
        //         })
        //     }
        // })
        senders.forEach(function (sender) {
            // if (sender.data('label') != 'Scanner') continue
            let nodes = receivers.filter(function (ele) {
                for (let input of ele.data('inputs') [0].input) {
                    for (let output of sender.data('outputs') [0].output) {
                        return output.jAttr.type == input.jAttr.type
                    }
                }
            })
            console.log(sender.data('label'))
            nodes.forEach(function (ele) {
                console.log(ele.data('label'));
            })
            console.log('');
        })
    }
    function getConnectableNodes(source, elements) {
        let nodes = cy.filter('node[inputs]')
        nodes = nodes.filter(function (ele) {
            for (let input of ele.data('inputs') [0].input) {
                for (let output of source.data('outputs') [0].output) {
                    return output.jAttr.type == input.jAttr.type
                }
            }
        })
        return nodes
    }
    cy.edgehandles({
        // toggleOffOnLeave: true,
        stackOrder: 1,
        hoverDelay: 0,
        handleSize: 300,
        handleColor: 'rgba(32, 45, 255, 0)',
        handlePosition: 'middle middle',
        // start: function (sourceNode) {
        //     // let connectable = cy.nodes(`node[col = ${sourceNode._private.data.col + 1}]`)
        //     // cy.nodes().style('events', 'no')
        //     // connectable.animate({
        //     //     style: { 'background-color': 'green'}
        //     // })
        //     // connectable.style({ 'events': 'yes' })
        // },
        // stop: function (sourceNode) {
        //     cy.nodes().style({ 'events': 'yes', 'background-color': '#505050' })
        //     // let connectable = cy.nodes(`node[col = ${sourceNode._private.data.col + 1}]`)
        //     // connectable.style({ 'background-color': '#505050', 'border-width': 0 })
        // },
        // complete: function (sourceNode, targetNodes, addedEntities) {
        //     cy.nodes().style({ 'events': 'yes', 'background-color': '#505050' })
        //     // addedEntities[0].style({'source-label': edgeLabels['source'], 'target-label': edgeLabels['target']})
        // },
    });

    cy.on('select tapdragover tapdragout cyedgehandles.start cyedgehandles.addpreview cyedgehandles.removepreview cyedgehandles.stop cyedgehandles.cancel cyedgehandles.hoverover cyedgehandles.previewon', 'node', function (e) {
        event = e.type + (e.namespace || '')
        console.log(event)
        // console.log(this);
        switch (event) {
            case 'tapdragover':
                SetChildren()
                // this.activate()
                // this.select()
                // this.style('background-color', '#3050a0')
                connectableNodes = getConnectableNodes(this, elements)
                connectableNodes.activate();
                break

            case 'cyedgehandles.cancel':
                // this.unactivate()
                // if (lastEvent == 'start') return
                // this.style('background-color', '#505050')
                // for (let target in connectableNodes) {
                // let connectable = cy.getElementById(connectableNodes[target]['id'])
                // connectable.style('border-width', 0)
                // }
                break

            case 'start':
                break

            case 'addpreview':
                break

            case 'removepreview':
                break
        }
        lastEvent = event
    });
    // cy.on('tapdragover', 'node', function (event) {
    //     console.log(this.id())
    //     if (state == 'started') return
    //     this.style('background-color', '#3050a0')
    //     connectableNodes = getConnectableNodes(this, elements)
    //     for (let target in connectableNodes) {
    //         // console.log(connectableNodes[target])
    //         let connectable = cy.getElementById(connectableNodes[target]['id'])
    //         connectable.style('events', 'yes')
    //         connectable.style('border-width', 2)
    //         connectable.style('border-color', 'lime')
    //         // connectable.style('border-style', 'double')
    //     }
    // });
    // cy.on('tapdragout', 'node', function (event) {
    //     if (state == 'started') return
    //     this.style('background-color', '#505050')
    //     for (let target in connectableNodes) {
    //         let connectable = cy.getElementById(connectableNodes[target]['id'])
    //         connectable.style('border-width', 0)
    //     }
    // });
    // cy.on('cyedgehandles.start', 'node', function (e) {
    //     state = 'started'
    //     source = this
    // });
    // cy.on('cyedgehandles.addpreview', 'node', function (e) {
    //     target = this

    //     cy.style().selector('.edgehandles-ghost-edge').style({
    //         visibility: 'hidden'
    //     }).update()


    //     function getConnections(source, target) {
    //         targets = []
    //         for (output of source._private.data.outputs[0].output) {
    //             for (input of target._private.data.inputs[0].input) {
    //                 if (output.jAttr.type == input.jAttr.type) {
    //                     targets.push({ 'source': output.jAttr.name, 'type': output.jAttr.type.replace('struct ', ''), 'target': input.jAttr.name })
    //                 }
    //             }
    //         }
    //         return targets
    //     }

    //     edgeLabels = getConnections(source, target)
    //     // console.log(edgeLabels)
    //     // edgeLabels['label'] = 'euenveviowd'
    //     // cy.style().selector('.edgehandles-preview').style('label', edgeLabels['type']).update()
    //     cy.style().selector('.edgehandles-preview').style('label', edgeLabels[0]['type']).update()
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
