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
        component.prospect = false
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
                    'control-point-distances': function (ele) {
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
            position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
        },
        elements: elements,
    });

    eh = cy.edgehandles({
        hoverDelay: 0,
        handlePosition: 'middle middle',
    })

    cy.ready(function (e) {
        /* Set receivers */
        cy.filter('node[outputs]').forEach(function (sender) {
            sender.data('receivers', cy.filter('node[inputs]').filter(function (receiver) {
                for (let input of receiver.data('inputs')[0].input) {
                    for (let output of sender.data('outputs')[0].output) {
                        return output.jAttr.type == input.jAttr.type && receiver !== sender
                    }
                }
            }))
        })
        cy.nodes().classes('default')
    })

    function getMatchingType(source, target) {
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
    let color = ['hotpink', 'orchid', 'mediumpurple', 'LightSkyBlue', 'MediumAquaMarine','LightSalmon', 'Coral']
    // let color = [hsl(270,60%, 70%)]
    cy.on('ehshow ehhide ehstart ehcomplete ehstop ehcancel ehpreviewon ehpreviewoff tapdragout',
        function (event, sourceNode, targetNode, addedEles) {
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
                    edgeLabels = getMatchingType(sourceNode, targetNode)
                    // cy.edges().last().style('target-label', edgeLabels[0]['type'])
                    cy.edges().last().style({ 'target-label': edgeLabels[0]['type'], 'line-color': color[(cy.edges().length - 2) % color.length] })

                    break
                case 'ehcomplete':
                case 'ehpreviewoff':
                    cy.edges().last().style('target-label', '')
                    // cy.style().selector('edge').style('label', '').update()
                    // cy.style().selector('.eh-ghost-edge').style('label', '').update()
                    cy.style().selector('.eh-ghost-edge').style({visibility: 'visible'}).update()
                    break
            }
            lastEvent = event.type
        }
    )

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
console.log(document.styleSheets);

