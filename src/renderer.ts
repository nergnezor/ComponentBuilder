import * as cytoscape from "cytoscape"
import { ipcRenderer } from "electron"
import { readFileSync } from "fs"
import { log } from "util"
import { toJson } from "xml2json"
const dagre = require("cytoscape-dagre")
const edgehandles = require("cytoscape-edgehandles")
dagre(cytoscape)
edgehandles(cytoscape)

ipcRenderer.on("selected-file", (event: any, path: string) => parseXml(path))

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

interface INode {
    name: string
    inputs: any
    outputs: any
    // col: number
    // row: number
    receivers: INode[],
}

function parseXml(path: string) {
    const xmlFile = readFileSync(path)
    const json = toJson(xmlFile.toString())
    const jsObj = JSON.parse(json)

    const components: INode[] = jsObj.rte.components.component

    /* Format inputs/outputs as arrays */
    components.forEach((c: any) => {
        if (c.outputs) {
            c.outputs = Array.isArray(c.outputs.output) ? c.outputs.output : [c.outputs.output]

        }
        if (c.inputs) {
            c.inputs = Array.isArray(c.inputs.input) ? c.inputs.input : [c.inputs.input]
        }
    })

    const edges: any = []
    const nodes: any = []
    components.forEach((component) => {
        component.id = component.name
        component.name = capitalizeFirstLetter(component.name).replace(/_/g, " ")
        nodes.push({ data: component })
    })
    console.log(components)
    /* Match outputs with inputs */
    components.filter((c) => c.outputs).forEach((sender) => {
        components.filter((c) => c.inputs).forEach((receiver) => {
            for (const input of receiver.inputs) {
                for (const output of sender.outputs) {
                    if (output.type === input.type && receiver !== sender) {
                        edges.push({
                            classes: "possibleEdge",
                            data: { source: sender.id, target: receiver.id, type: output.type },
                        })
                        return
                    }
                }
            }
        })
    })

    const cy = cytoscape({
        // autoungrabify: true,
        // autounselectify: true,
        boxSelectionEnabled: false,
        container: document.getElementById("cy"),
        elements: {
            nodes,
            edges,
        },
        style: [
            {
                selector: ".default",
                style: {
                    "background-color": "#505050",
                    "border-opacity": 0,
                    // 'z-index': 9007199254740992
                },
            },
            {
                selector: ".possibleEdge",
                style: {
                    display: "none",
                    opacity: 0.1,
                    events: "no",
                },
            },
            {
                selector: ".connectedEdge",
                style: {
                    "curve-style": "bezier",
                    "opacity": 1,
                },
            },
            {
                selector: ".prospect",
                style: {
                    "background-color": "#505050",
                    // 'background-color': '#507050',
                    "border-color": "white",
                    "border-opacity": 1,
                    // prospect: true
                },
            },
            {
                selector: ":selected",
                style: {
                    "border-color": "orange",
                    "border-opacity": 1,
                },
            },
            {
                selector: "node",
                style: {
                    "border-width": 1,
                    "color": "white",
                    "content": "data(name)",
                    "font-size": 8,
                    "height": "label",
                    "overlay-opacity": 0,
                    "padding": "8px",
                    "shape": "roundrectangle",
                    "text-max-width": 100,
                    "text-valign": "center",
                    "text-wrap": "wrap",
                    "width": "label",
                },
            },
            {
                selector: "edge",
                style: {
                    "color": "white",
                    // "control-point-distances"(ele: any) {
                    //     // log(ele.source());
                    //     let distances = [0, 0]
                    //     if (ele.target().data("label")) {
                    //         // log(ele);

                    //         // let ySource = ele.source().position().y;
                    //         // var yTarget = ele.target().position().y;
                    //         const dx = ele.target().position().x - ele.source().position().x
                    //         const dy = ele.target().position().y - ele.source().position().y
                    //         const dcol = ele.target().data("col") - ele.source().data("col")
                    //         const distance = (dy / 2) / (dcol + 1 / 1)
                    //         // if (ySource < yTarget) return [-100, 100]
                    //         // else return [100, -100]
                    //         // distances = [dy > 0 ? -100 : 100, dy > 0 ? 100 : -100]
                    //         distances = [-distance, distance]

                    //         // var str = '' + Math.abs(pos2 - pos1) + 'px -' + Math.abs(pos2 - pos1) + 'px';

                    //         // log(pos1, pos2, str);
                    //     }
                    //     return distances
                    // },
                    // "control-point-weights": [0.1, 0.9],
                    // "curve-style": "unbundled-bezier",
                    "curve-style": "bezier",
                    "font-size": 12,
                    "line-style": "solid",
                    // "opacity": 0.1,
                    "target-arrow-color": "#ccc",
                    "target-arrow-shape": "triangle",
                    // 'z-index': 9007199254740992
                    // 'label': 'data(label)',
                    // 'label': 'hej',
                    // 'source-label': 'data(label)',
                    // 'target-label': 'target',
                    // 'source-text-offset': 50,
                    "target-text-margin-y": -10,
                    "target-text-offset": 50,
                    "text-rotation": "autorotate",
                    "width": 1,
                },
            },
            // {
            //     selector: '.eh-ghost-edge',
            //     style: {
            //         'line-style': 'dotted',
            //     }
            // },
            {
                selector: ".eh-handle",
                style: {
                    height: 50,
                    opacity: 0,
                    width: 100,
                    // 'z-index': 1
                    // 'events': ['tapdragover', 'no'],
                    // 'background-color': '#FF5050',
                    // 'display': 'none'
                },
            },
            {
                selector: ".eh-source",
                style: {
                    "background-color": "#505090",
                    "border-color": "yellow",
                },
            },
            {
                selector: ".eh-preview",
                style: {
                    "border-color"(ele: any, target, added) {
                        console.log(ele)
                        // console.log(target)
                        // console.log(added)
                        return "white"
                    },
                    "curve-style": "bezier",
                    "opacity": 1,
                },
            },
        ],

        layout: {
            // cols: nCols,
            // name: "breadthfirst",
            name: "dagre",
            // name: "grid",
            // rows: nRows,
            // rows: 1,
            // position(node: any) { return { row: node.data("row"), col: node.data("col") } },
        },
        userPanningEnabled: false,
        userZoomingEnabled: false,
    })

    const eh = cy.edgehandles({
        handlePosition: "middle middle",
        hoverDelay: 0,
    })

    cy.ready((e: any) => {
        cy.nodes().classes("default")
    })

    // function getMatchingType(source: any, target: any) {
    //         const targets = []
    //         for (const output of source.data("outputs").output) {
    //             for (const input of target.data("inputs").input) {
    //                 if (output.type === input.type) {
    //                     targets.push({ source: output.name, type: output.type.replace("struct ", ""), target: input.name })
    //                 }
    //             }
    //         }
    //         return targets
    //     }
    const color = ["hotpink", "orchid", "mediumpurple", "LightSkyBlue", "MediumAquaMarine", "LightSalmon", "Coral"]
    // let color = [hsl(270,60%, 70%)]
    let lastEvent = ""
    cy.on("tapdragout tapdragover ehstart", "node", (evt) => {
        const node = evt.target
        // log("tapped " + node.id())
        // console.log(evt.type, evt.target.id())
    })
    // cy.on("ehstart", (evt, sourceNode) => {
    //     const node = evt.target
    //     // log("tapped " + node.id())
    //     console.log(evt.type)
    // })
    cy.on("ehshow ehhide ehstart ehcomplete ehstop ehcancel ehpreviewon ehpreviewoff tapdragout",
        (event: cytoscape.EventObject, sourceNode: cytoscape.NodeCollection, targetNode: any, addedEles: any) => {
            // log(event.type)
            switch (event.type) {
                case "ehshow":
                    // sourceNode.activate()
                    // console.log(sourceNode.connectedEdges())
                    sourceNode.select()
                    sourceNode.outgoers(".possibleEdge").style("display", "element")
                    // sourceNode.data("receivers").classes("prospect")
                    // cy.nodes().filter(".default").style("events", "no")
                    break

                    case "ehhide":
                    cy.nodes(":selected").connectedEdges().style("display", "none")
                    cy.nodes(":selected").deselect()
                    // cy.nodes().filter(".prospect").classes("default")
                    // cy.nodes().filter(".default").style("events", "yes")
                    break

                case "tapdragover":
                    break

                case "ehstop":
                    eh.hide()
                    break
                case "tapdragout":
                    if (event.target.hasClass("default")) { return }
                    if (lastEvent === "ehstart") { return }
                    if (lastEvent === "ehpreviewoff") { return }
                    // if (lastEvent == 'tapdragout'){// && event.target.hasClass('eh-handle')) {

                    eh.hide()
                    // }
                    break

                case "cancel":
                    break

                case "ehstart":
                    break

                case "ehpreviewon":
                    // cy.edges(".possibleEdge").style("display", "none")

                    // cy.style().selector(".eh-ghost-edge").style({ visibility: "hidden" }).update()
    //                 const edgeLabels = getMatchingType(sourceNode, targetNode)
    //                 // cy.edges().last().style('target-label', edgeLabels[0]['type'])
    //                 cy.edges().last().style({
    // "target-label": edgeLabels[0].type, "line-color": color[(cy.edges().length - 2) % color.length],
    // })

                    break
                case "ehcomplete":
                case "ehpreviewoff":
                    cy.edges().last().style("target-label", "")
                    // cy.style().selector('edge').style('label', '').update()
                    // cy.style().selector('.eh-ghost-edge').style('label', '').update()
                    cy.style().selector(".eh-ghost-edge").style({ visibility: "visible" }).update()
                    break
            }
            lastEvent = event.type
        },
    )

    const layout = cy.layout({
        // cols: nCols,
        // name: "grid",
        name: "dagre",
        // rows: 1,
        // position(node: any) { return { row: node.data("row"), col: node.data("col") } },
    })
    cy.on("resize", () => layout.run())
}

parseXml(__dirname + "/../components.xml")
