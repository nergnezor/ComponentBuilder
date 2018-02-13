import * as cytoscape from "cytoscape"
import { dialog, ipcRenderer } from "electron"
import { readFileSync } from "fs"
import { log } from "util"
import { toJson } from "xml2json"
// import * as autosarXsd from "./xmlns/autosar.xsd"
import * as autosarXsd from "./../xmlns/autosar.xsd"

// const metadata = wfs.document.rte.constructor().
const dagre = require("cytoscape-dagre")
const edgehandles = require("cytoscape-edgehandles")
dagre(cytoscape)
edgehandles(cytoscape)

ipcRenderer.on("selected-file", (event: any) => {
  dialog.showOpenDialog({
    filters: [{
      extensions: ["xml"],
      name: "Components XML",
    }],
    properties: ["openFile"],
  },
    (files) => {
      if (files) {
        parseXml(files[0])
      }
    })
})

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
  const components: autosarXsd.ComponentsType = jsObj.rte.components

  const edges: any = []
  const nodes: any = []
  components.component.forEach((component) => {
    component.id = component.name
    console.log(component)

    nodes.push({ data: component })
  })

  function createEdges(outputs: string, inputs: string, type: string, shape: string) {
    components.component.filter((c: any) => c[outputs]).forEach((sender: any) => {
      let outputArray: any = sender[outputs][outputs.slice(0, outputs.length - 1)]
      outputArray = Array.isArray(outputArray) ? outputArray : [outputArray]
      for (const output of outputArray) {
        components.component.filter((c: any) => c[inputs]).forEach((receiver: any) => {
          let inputArray: any = receiver[inputs][inputs.slice(0, inputs.length - 1)]
          inputArray = Array.isArray(inputArray) ? inputArray : [inputArray]
          for (const input of inputArray) {
            if (output[type] === input[type] && receiver !== sender) {
              edges.push({
                classes: "possibleEdge",
                data: { source: sender.id, target: receiver.id, type: output.name },
                style: {
                  "target-arrow-shape": shape,
                },
              })
              return
            }
          }
        })
      }
    })
  }
  createEdges("outputs", "inputs", "type", "triangle")
  createEdges("client_ports", "server_ports", "port_definition", "circle")

  const colors = ["hotpink", "orchid", "mediumpurple", "LightSkyBlue", "MediumAquaMarine", "LightSalmon", "Coral"]

  const cy = cytoscape({
    autoungrabify: true,
    // autounselectify: true,
    boxSelectionEnabled: false,
    container: document.getElementById("cy"),
    elements: {
      edges,
      nodes,
    },
    maxZoom: 1.2,
    style: [
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
          // opacity: 0.1,
          "line-color": "#404040",
          "line-style": "dotted",
          "target-arrow-color": "#404040",
          "target-arrow-fill": "hollow",
        },
      },
      //   {
      //     selector: ".hidden",
      //     style: {
      //       display: "none",
      //     },
      //   },
      {
        selector: ":selected",
        style: {
          "border-color": "darkGrey",
          "border-opacity": 1,
        },
      },
      {
        selector: "node",
        style: {
          "background-color": "#505050",
          "border-color": "white",
          "border-width": "1",
          "color": "white",
          // "content": "data(name)",
          "content"(ele: cytoscape.NodeCollection) {
            return ele.id().replace(/_/g, " ")
            // return capitalizeFirstLetter(ele.id().replace("_", " "))
          },
          "font-size": 12,
          "height": "label",
          "overlay-opacity": 0,
          "padding": 10,
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
          // "color": "white",
          "curve-style": "bezier",
          "font-size": 8,
          "width": 1,
        },
      },
      {
        selector: ".eh-handle",
        style: {
          height: 30,
          opacity: 0,
          width: 50,
        },
      },
    ],
    userPanningEnabled: false,
    userZoomingEnabled: false,
  })
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
      /* Deactivate other nodes */
      cy.nodes(".default").not(node.outgoers().connectedNodes()).style("events", "no")
      cy.nodes(".default").not(node.outgoers()).not(node).style("opacity", 0.3)
    },
    hide() {
      cy.edges(".possibleEdge").not(".hidden").style("display", "element")
      cy.nodes(":selected").deselect()
      cy.nodes().style("events", "yes")
      cy.nodes().style("opacity", 1)
    },
    previewon(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection) {
      cy.edges(".eh-ghost-edge").style("display", "none")
      const possibleEdge = sourceNode.edgesTo(targetNode).filter(".possibleEdge")
      possibleEdge.style("display", "none")
      sourceNode.edgesTo(targetNode).last().style("target-arrow-shape",
        sourceNode.edgesTo(targetNode).first().style("target-arrow-shape"))
    },
    previewoff(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection) {
      sourceNode.edgesTo(targetNode).filter(".possibleEdge").style("display", "element")
      cy.edges(".eh-ghost-edge").style("display", "element")
    },
    stop() {
      cy.edges().style("label", "")
      eh.hide()
    },
    complete(sourceNode: cytoscape.NodeCollection, targetNode: cytoscape.NodeCollection) {
      sourceNode.edgesTo(targetNode).filter(".possibleEdge").classes(".hidden")
      targetNode.select()
      eh.show(targetNode)

    },
  })
  const dagreLayout = {
    animate: true,
    animationDuration: 500,
    name: "dagre",
  }
  const layout = cy.layout(dagreLayout)
  cy.ready((e: any) => {
    cy.nodes().classes("default")
    layout.run()
  })
  cy.on("resize", () => layout.run())

  let onlyShowConnectedNodes = false
  let removedNodes: cytoscape.Collection

  ipcRenderer.on("switch-view", (event: any) => {
    onlyShowConnectedNodes = !onlyShowConnectedNodes
    if (onlyShowConnectedNodes) {
      const connectedNodes = cy.nodes().filter((ele) => ele.connectedEdges().not(".possibleEdge").length > 0)
      removedNodes = cy.elements()
      cy.nodes().not(connectedNodes).remove()
      cy.elements().makeLayout(dagreLayout).run()
    } else {
      removedNodes.restore()
      layout.run()
    }
  })
}

parseXml(__dirname + "/../components.xml")
