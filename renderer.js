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
        console.log(c.jAttr.name + ' [' + output.jAttr.type + '] -> ')
        for (let c2 of components) {
            if (c2.col || !c2.inputs) {
                continue
            }
            for (let input of c2.inputs[0].input) {
                if (input.jAttr.type == output.jAttr.type) {
                    console.log('\t' + c2.jAttr.name /*+ input.jAttr.type*/)
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
    console.log(nCols)

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
            data: component
        })
    })

    var cy = cytoscape({
        container: document.getElementById('cy'),
        boxSelectionEnabled: false,
        autounselectify: true,
        userZoomingEnabled: false,
        userPanningEnabled: false,
        // zoomingEnabled: false,
        // panningEnabled: false,
        autoungrabify: true,
        style: [{
            selector: 'core',
            css: {
                'active-bg-color': 'red',
                'selection-box-color': 'red',
                'selection-box-border-color': 'red',
                'overlay-color': 'red'
            }
        }, {
            selector: ':active',
            css: {
                'line-color': '#ff0000',
                'line-style': 'solid',
                'overlay-color': '#00ff00',
            }
        }, {
            selector: ':selected',
            css: {
                'background-color': 'red'
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
                'width': 2,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'unbundled-bezier',
                'source-label': 'hej'
            }
        }, {
            selector: '.edgehandles-hover',
            css: {
                'background-color': 'purple'
            }
        }, {
            selector: '.edgehandles-source',
            css: {
                'border-width': 2,
                'border-color': 'yellow'
            }
        }, {
            selector: '.edgehandles-target',
            css: {
                'border-width': 2,
                'border-color': 'cyan'
            }
        }, {
            selector: '.edgehandles-preview, .edgehandles-ghost-edge',
            css: {
                'line-color': 'yellow',
                'target-arrow-color': 'blue',
                'source-arrow-color': 'green'
            }
        }],

        layout: {
            name: 'grid',
            rows: nRows,
            cols: nCols,
            // minZoom: 0.5,
            // maxZoom: 1.0,
            // fit: false,
            // condense: true,
            // padding: 300,
            position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
        },
        elements: elements,
    });
    // cy.userZoomingEnabled(false)
    // cy.userPanningEnabled(false)
    cy.edgehandles({
        toggleOffOnLeave: true,
        //         handleNodes: "node",
        handleSize: 300,
        handleColor: 'rgba(32, 45, 21, 0)',
        stackOrder: 1,
        //         handleOutlineWidth: 3,
        handlePosition: 'middle middle',
        edgeType: function () {
            return 'flat';
        },
        start: function (sourceNode) {
            // fired when edgehandles interaction starts (drag on handle)
            // cy.nodes("[label='Scanner']").style('color', 'grey')
            // let connectable = cy.elements(`node[col = ${sourceNode._private.data.col + 1}]`)
            let connectable = cy.nodes(`node[col = ${sourceNode._private.data.col + 1}]`)
            connectable.style({'color': 'blue', 'border-width': 2, 'border-color': 'green'})
            console.log('\n' + sourceNode._private.data.jAttr.name, sourceNode._private.data.col)
            // if (sourceNode._private.data.inputs) {
            //     console.log('Inputs:')
            //     for (input of sourceNode._private.data.inputs[0].input) {
            //         console.log('\t[' + input.jAttr.type + '] ' + input.jAttr.name)
            //         console.log()
            //     }
            // }
            // if (sourceNode._private.data.outputs) {
            //     console.log('Outputs:')
            //     for (output of sourceNode._private.data.outputs[0].output) {
            //         console.log('\t[' + output.jAttr.type + '] ' + output.jAttr.name)
            //         console.log()
            //     }
            // }
        },
    });
    cy.on('mouseover', 'node', function (event) {//         console.log(event)
        // console.log(this.id())
        this.style('background-color', '#3050a0')
    });
    cy.on('mouseout', 'node', function (event) {//         console.log(event)
        this.style('background-color', '#505050')
    });
    cy.on('cyedgehandles.start', 'node', function (e) {
        var srcNode = this;

    });
    cy.on('cyedgehandles.stop', 'node', function (e) {
        var srcNode = this;
        // cy.nodes("[label='Scanner']").show()
    });

    var layout = cy.nodes().layout({
        name: 'grid',
        rows: nRows,
        cols: nCols,
        position: function (node) { return { row: node.data('row'), col: node.data('col') }; }
      });
    cy.on('resize', function () {
        console.log('cy resized');
        // cy.fit(cy.nodes())
          layout.run()
    });

}

parseXml(__dirname + '/components.xml')
