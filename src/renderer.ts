import * as cytoscape from "cytoscape"
import { dialog, ipcRenderer } from "electron"
import { readFileSync, writeFileSync } from "fs"
import { toJson } from "xml2json"

const dagre = require("cytoscape-dagre")
const edgehandles = require("cytoscape-edgehandles")
dagre(cytoscape)
edgehandles(cytoscape)

parseXml(__dirname + "/../components.xml")
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

function parseXml(path: string) {
  const xmlFile = readFileSync(path)
  const json = toJson(xmlFile.toString())
  const jsObj = JSON.parse(json)
  const components: any[] = jsObj.rte.components.component

  /* Get inputs/outputs from components */
  for (const component of components) {
    ["client_ports", "server_ports", "inputs", "outputs"].forEach((io) => {
      if (!component[io]) {
        component[io] = []
        return
      }
      const ioSingular = component[io][io.slice(0, io.length - 1)]
      component[io] = Array.isArray(ioSingular) ? ioSingular : [ioSingular]
    })
  }

  /* Set possible connections and create edges between connectable nodes */
  const edges: any = []
  const nodes: any = []
  components.forEach((sender) => {
    const outputs: any = []
    for (const output of [...sender.outputs, ...sender.client_ports]) {
      const targets: string[] = []
      const shape = output.type ? "triangle" : "circle"
      const type = output.type || output.port_definition
      components.forEach((receiver) => {
        if (sender === receiver) { return }
        for (const input of [...receiver.inputs, ...receiver.server_ports]) {
          if (type === (input.type || input.port_definition)) {
            targets.push(receiver.name)
            edges.push({
              classes: "possibleEdge",
              data: {
                source: sender.name,
                target: receiver.name,
              },
              style: {
                "target-arrow-shape": shape,
              },
            })
          }
        }
      })
      outputs.push({
        name: output.name,
        shape,
        size: output.array_size || 1,
        targets,
        type,
      })
    }
    nodes.push({
      data: {
        id: sender.name,
        outputs,
      },
    })
  })
  createGraph(nodes, edges)
}

function createGraph(nodes: any, edges: any) {
  const colors = ["hotpink", "orchid", "mediumpurple", "LightSkyBlue", "MediumAquaMarine", "LightSalmon", "Coral"]
  function getPossibleConnections(source: cytoscape.NodeCollection, target: cytoscape.NodeCollection) {
    return source.data("outputs").filter((output: any) => output.targets.includes(target.id()))
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
    maxZoom: 1.2,
    style: [
      {
        selector: ".possibleEdge",
        style: {
          "line-style": "dotted",
          "opacity": 0.3,
          "target-arrow-fill": "hollow",
          "text-opacity": "0",
        },
      },
      {
        selector: "node",
        style: {
          "background-color": "#505050",
          "border-color": "white",
          "border-width": "0",
          "color": "white",
          "content"(ele: cytoscape.NodeCollection) {
            return ele.id().replace(/_/g, " ")
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
          "color": "white",
          "curve-style": "bezier",
          "font-size": 10,
          "target-arrow-color": "white",
          "width": 1,
        },
      },
    ],
    userPanningEnabled: false,
    userZoomingEnabled: false,
  })
  /* Interaction */
  cy.on("select", (event) => {
    cy.nodes().not(event.target.outgoers()).not(event.target).style("opacity", 0.3)
    event.target.style("border-width", 1)
  })
  cy.on("unselect", (event) => {
    cy.nodes().style("border-width", 0)
    cy.nodes().style("opacity", 1)
  })
  cy.on("tapdragover", "node", (event) => !eh.active && event.target.select())
  cy.on("tapdragout", "node", (event) => !eh.active && event.target.unselect())

  const eh = cy.edgehandles({
    cancel: (source: cytoscape.NodeCollection) => source.unselect(),
    complete: (source: cytoscape.NodeCollection, target: cytoscape.NodeCollection, edge: cytoscape.NodeCollection) => {
      if (!edge.style("label")) {
        edge.remove()
      }
      source.edgesTo(target).filter(".possibleEdge").remove()
      source.unselect()
      target.select()
      const color = colors[cy.edges().not(".possibleEdge").length % colors.length]
      edge.style("line-color", color)
      edge.style("target-arrow-color", color)
    },
    previewoff: (source: cytoscape.NodeCollection, target: cytoscape.NodeCollection) => {
      source.edgesTo(target).filter(".possibleEdge").style("display", "element")
      cy.edges(".eh-ghost-edge").style("display", "element")
    },
    previewon: (source: cytoscape.NodeCollection, target: cytoscape.NodeCollection) => {
      cy.edges(".eh-ghost-edge").style("display", "none")
      source.edgesTo(target).filter(".possibleEdge").style("display", "none")
      const connections = getPossibleConnections(source, target)
      if (connections.length === 1) {
        cy.edges().last().style("label", connections[0].name.replace(/_/g, " "))
        cy.edges().last().style("target-arrow-shape", connections[0].shape)
      }
    },
  })
  eh.enableDrawMode() // Don't use external edge handles

  /* Layout */
  const dagreLayout = {
    animate: true,
    animationDuration: 500,
    name: "dagre",
  }
  const layout = cy.layout(dagreLayout)
  cy.ready((e: any) => {
    layout.run()
  })
  cy.on("resize", () => layout.run())

  /* Switch view. Alternate view only shows connected nodes */
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
