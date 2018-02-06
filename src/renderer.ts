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
    const style: cytoscape.Stylesheet[] = [
        {
            selector: ".default",
            style: {
                "border-opacity": 0,
            },
        },
        {
            selector: ".possibleEdge",
            style: {
                display: "none",
                opacity: 0.1,
            },
        },
        {
            selector: ":selected",
            style: {
                "border-color": "yellow",
                "border-opacity": 1,
            },
        },
        {
            selector: "node",
            style: {
                "background-color": "#505050",
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
                "curve-style": "bezier",
                "font-size": 12,
                // "line-style": "solid",
                // "opacity": 0.1,
                "target-arrow-color": "#ccc",
                "target-arrow-shape": "triangle",
                "target-text-margin-y": -10,
                "target-text-offset": 50,
                "text-rotation": "autorotate",
                "width": 1,
            },
        },
        {
            selector: ".eh-handle",
            style: {
                height: 50,
                opacity: 0,
                width: 100,
            },
        },
    ]
    const layout = {
        name: "dagre",
    }

    const cy = cytoscape({
        autoungrabify: true,
        // autounselectify: true,
        boxSelectionEnabled: false,
        container: document.getElementById("cy"),
        elements: {
            edges,
            nodes,
        },
        layout,
        style,
        userPanningEnabled: false,
        userZoomingEnabled: false,
    })

    const eh = cy.edgehandles({
        handlePosition: "middle middle",
        hoverDelay: 0,
        show(node: cytoscape.NodeCollection) {
            node.select()
            node.outgoers(".possibleEdge").style("display", "element")
            /* Deactivate other nodes */
            cy.nodes(".default").not(node.outgoers(".possibleEdge").connectedNodes()).style("events", "no")

        },
        hide() {
            cy.nodes(":selected").connectedEdges(".possibleEdge").style("display", "none")
            cy.nodes(":selected").deselect()
            cy.nodes().style("events", "yes")
        },
        previewon(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection) {
            sourceNode.edgesTo(targetNode).filter(".possibleEdge").style("display", "none")
            cy.edges(".eh-ghost-edge").style("display", "none")

        },
        previewoff(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection) {
            sourceNode.edgesTo(targetNode).filter(".possibleEdge").style("display", "element")
            cy.edges(".eh-ghost-edge").style("display", "element")
        },
        stop() {
            eh.hide()
        },
        complete(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection, added) {
            // console.log(sourceNode.edgesTo(targetNode).filter(".possibleEdge").classes(".deletedEdge"))
        },

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
    const lastEvent = ""
    cy.on("tapdragout", "node", (event) => {
        const node: cytoscape.NodeCollection = event.target
        if (node.hasClass("eh-handle") && !cy.edges(".eh-ghost-edge").length) {
            // console.log(cy.edges(".eh-ghost-edge"))
            // console.log(node.edges())
            eh.hide()
        }
    })

    cy.on("resize", () => layout.run())
}

parseXml(__dirname + "/../components.xml")
