import * as cytoscape from "cytoscape"
import { dialog, ipcRenderer } from "electron"
import { readFileSync, writeFileSync } from "fs"
import { log } from "util"
import { toJson } from "xml2json"
import * as xmlBuilder from "xmlbuilder"
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

function parseXml(path: string) {
  const xmlFile = readFileSync(path)
  const json = toJson(xmlFile.toString())
  const jsObj = JSON.parse(json)
  const components: autosarXsd.ComponentsType = jsObj.rte.components

  const edges: any = []
  const nodes: any = []
  components.component.forEach((component: any) => {
    component.id = component.name
    // console.log(component, component.outputs)

    nodes.push({ data: component })
  })
  const xmlOutput = xmlBuilder.create(components.component[0])
    .end({ pretty: true })
  // console.log(xmlOutput)
  // writeFileSync(__dirname + "/test.xml", xmlOutput.toString())

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
                  "label": output.name,
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
        selector: ".possibleEdge",
        style: {
          // display: "none",
          "line-color": "#404040",
          "line-style": "dotted",
          "target-arrow-color": "#404040",
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
          // "border-opacity": 0,
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
          "color": "white",
          "curve-style": "bezier",
          "events": "no",
          "font-size": 10,
          // "label": "data(type)",
          "width": 1,
        },
      },
    ],
    userPanningEnabled: false,
    userZoomingEnabled: false,
  })

  cy.on("tapdragout tapdragover ehcomplete ehpreviewon ehpreviewoff ehcancel ehstop select unselect ehshow ehstart",
    (event, source, target, edge) => {
      // console.log(event.type)
      switch (event.type) {
        case "select":
          cy.nodes().not(event.target.outgoers()).not(event.target).style("opacity", 0.3)
          event.target.style("border-width", 1)
          break
        case "unselect":
          cy.nodes().style("border-width", 0)
          cy.nodes().style("opacity", 1)
          break
        case "tapdragover":
          if (eh.active) { return }
          event.target.select()
          break
        case "tapdragout":
          if (eh.active) { return }
          event.target.deselect()
          break
        case "ehpreviewon":
          cy.edges(".eh-ghost-edge").style("display", "none")
          source.edgesTo(target).filter(".possibleEdge").style("display", "none")
          const firstEdge = source.edgesTo(target).first()
          const lastEdge = source.edgesTo(target).last()
          lastEdge.style("target-arrow-shape", firstEdge.style("target-arrow-shape"))
          lastEdge.style("label", firstEdge.style("label"))
          break
        case "ehpreviewoff":
          source.edgesTo(target).filter(".possibleEdge").style("display", "element")
          cy.edges(".eh-ghost-edge").style("display", "element")
          break
        case "ehcancel":
          source.unselect()
          break
        case "ehstop":
          break
        case "ehcomplete":
          source.deselect()
          target.select()
          break
      }
    })

  const eh = cy.edgehandles({
    handlePosition: "middle middle",
    hoverDelay: 0,
  })
  eh.enableDrawMode()

  const dagreLayout = {
    animate: true,
    animationDuration: 500,
    name: "dagre",
  }
  const layout = cy.layout(dagreLayout)
  cy.ready((e: any) => {
    // cy.nodes().classes("default")
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
