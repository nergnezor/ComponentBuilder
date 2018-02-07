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

interface INode {
  id: string
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

  const edges: any = []
  const nodes: any = []
  components.forEach((component) => {
    component.id = component.name
    nodes.push({ data: component })
  })

  function createEdges(outputs: string, inputs: string, type: string) {
    components.filter((c: any) => c[outputs]).forEach((sender: any) => {
      let outputArray: any = sender[outputs][outputs.slice(0, outputs.length - 1)]
      outputArray = Array.isArray(outputArray) ? outputArray : [outputArray]
      for (const output of outputArray) {
        components.filter((c: any) => c[inputs]).forEach((receiver: any) => {
          let inputArray: any = receiver[inputs][inputs.slice(0, inputs.length - 1)]
          inputArray = Array.isArray(inputArray) ? inputArray : [inputArray]
          for (const input of inputArray) {
            if (output[type] === input[type] && receiver !== sender) {
              edges.push({
                classes: "possibleEdge",
                data: { source: sender.id, target: receiver.id, type: output.name },
              })
              return
            }
          }
        })
      }
    })
  }
  createEdges("outputs", "inputs", "type")
  createEdges("server_ports", "client_ports", "port_definition")

  const colors = ["hotpink", "orchid", "mediumpurple", "LightSkyBlue", "MediumAquaMarine", "LightSalmon", "Coral"]
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
        // display: "none",
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
        // "content": "data(name)",
        "content"(ele: cytoscape.NodeCollection) {
          return ele.id().replace(/_/g, " ")
          // return capitalizeFirstLetter(ele.id().replace("_", " "))
        },
        "font-size": 8,
        "height": "label",
        "overlay-opacity": 0,
        "padding": 6,
        "shape": "roundrectangle",
        "text-max-width": 50,
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
        "font-size": 8,
        "target-arrow-shape": "triangle",
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

  const cy = cytoscape({
    autoungrabify: true,
    // autounselectify: true,
    boxSelectionEnabled: false,
    container: document.getElementById("cy"),
    elements: {
      edges,
      nodes,
    },
    style,
    userPanningEnabled: false,
    userZoomingEnabled: false,
  })
  const layout = cy.layout({
    name: "dagre",
  })
  cy.ready((e: any) => {
    cy.nodes().classes("default")
    layout.run()
  })
  cy.on("resize", () => layout.run())
  cy.on("tapdragout", "node", (event) => {
    const node: cytoscape.NodeCollection = event.target
    if (node.hasClass("eh-handle") && !cy.edges(".eh-ghost-edge").length) {
      eh.hide()
    }
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
      cy.edges(".eh-ghost-edge").style("display", "none")
      const possibleEdge = sourceNode.edgesTo(targetNode).filter(".possibleEdge")
      possibleEdge.style("display", "none")
      const newEdge = sourceNode.edgesTo(targetNode).not(possibleEdge).first()
      newEdge.style("label", possibleEdge.data("type"))
      newEdge.style("line-color", colors[cy.edges().length % colors.length])

    },
    previewoff(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection) {
      sourceNode.edgesTo(targetNode).filter(".possibleEdge").style("display", "element")
      cy.edges(".eh-ghost-edge").style("display", "element")
    },
    stop() {
      cy.edges().style("label", "")
      eh.hide()
    },
  })
}

parseXml(__dirname + "/../components.xml")
