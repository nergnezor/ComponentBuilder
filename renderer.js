// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const fs = require("fs");

const x2j = require('./js/xml2json')
const vis = require('./js/vis.min')
const cytoscape = require('cytoscape')
var edgehandles = require('cytoscape-edgehandles');

edgehandles(cytoscape);
// register extension
// var jquery = require('./js/jquery-3.2.1.min')
// const csee = require('./js/CytoscapeEdgeEditation')
// import CytoscapeEdgeEditation from './js/CytoscapeEdgeEditation'

// cytoscape.use( require('./js/CytoscapeEdgeEditation') );
// cytoscape.use('CytoscapeEdgeEditation');

const selectDirBtn = document.getElementById('select-file')

selectDirBtn.addEventListener('click', function(event) {
    ipc.send('open-file-dialog')
})

ipc.on('selected-file', function(event, path) {
    document.getElementById('selected-file').innerHTML = `You selected: ${path}`
    parseXml(path)
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function parseXml(path) {
    var data = fs.readFileSync(path);
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data.toString(), "text/xml");
    var jsObj = X2J.parseXml(xmlDoc)
    components = jsObj[0].rte[0].components[0].component
    elements = []
    components.forEach(function(element) {
        elements.push({
            data: {
                id: element.jAttr.name,
                label: capitalizeFirstLetter(element.jAttr.name).replace(/_/g, ' '),
                'source-label': 'wfoihw',
                type: 'type2'
            },
        })
    })

    var cy = cytoscape({
        container: document.getElementById('cy'),
        boxSelectionEnabled: false,
        //         autounselectify: true,
        zoomingEnabled: false,
        panningEnabled: false,
        autoungrabify: true,
        "active-bg-size": 200,
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
                //'overlay-padding': '100px',
                'overlay-opacity': 100
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
//                                 'background-color': '#505050',
                'active-bg-color': 'white',
                content: 'data(label)',
                'text-wrap': 'wrap',
                'text-max-width': 100,
                'text-valign': 'center',
                //         'text-halign': 'center',
                //         'text-transform': 'uppercase',
                color: 'white',
                width: 'label',
                height: 'label',
                padding: '10px'
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
                'border-color': 'red'
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
            name: 'circle',
            rows: 4
        },
        elements: elements //                 elements: [{
    });

    cy.edgehandles({
        toggleOffOnLeave: true,
        //         handleNodes: "node",
        handleSize: 300,
        handleColor: 'rgba(32, 45, 21, 0)',
        stackOrder: 1,
        //         handleOutlineWidth: 3,
        handlePosition: 'middle middle',
        edgeType: function() {
            return 'flat';
        },
        start: function(sourceNode) {
            // fired when edgehandles interaction starts (drag on handle)
            console.log(sourceNode)
        },
    });
    cy.on('mouseover', 'node', function(event) {//         console.log(event)
    //         console.log(this.id())
    //         cy.nodes('#1').select();
            event.target.select()
    //         cy.edgehandles.showhandle
    });
        cy.on('mouseout', 'node', function(event) {//         console.log(event)
            event.target.unselect()
    });
    cy.on('cyedgehandles.start', 'node', function(e) {
        var srcNode = this;
        //         console.log('efwf')
        //         srcNode.target.select()
        // ...
    });
}

parseXml('C:/stash/electron-quick-start/components.xml')
