import { on } from "cluster"
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

interface IData {
  id
  inputs
  outputs
  clientPorts
  serverPorts
}

function parseXml(path: string) {
  const xmlFile = readFileSync(path)
  const json = toJson(xmlFile.toString())
  const jsObj = JSON.parse(json)
  // const components: autosarXsd.ComponentsType = jsObj.rte.components
  const components: IData[] = []

  const edges: any = []
  const nodes = []
  for (const c of jsObj.rte.components.component) {
    // c.id = c.name
    // console.log(component, component.outputs)

    // nodes.push({ data: c })
    // const inputs = c.inputs ? (Array.isArray(c.inputs.input) ? c.inputs.input : [c.inputs.input]) : []
    // const outputs = c.outputs ? (Array.isArray(c.outputs.output) ? c.outputs.output : [c.outputs.output]) : []
    // const server_ports = c.server_ports ? (Array.isArray(c.server_ports.server_port) ? c.server_ports.server_port : [c.server_ports.server_port]) : []
    // const client_ports = c.client_ports ? (Array.isArray(c.client_ports.client_port) ? c.client_ports.client_port : [c.client_ports.client_port]) : []

    const data: IData = {
      clientPorts: c.client_ports ?
        (Array.isArray(c.client_ports.client_port) ? c.client_ports.client_port : [c.client_ports.client_port]) : [],
      id: c.name,
      inputs: c.inputs ? (Array.isArray(c.inputs.input) ? c.inputs.input : [c.inputs.input]) : [],
      outputs: c.outputs ? (Array.isArray(c.outputs.output) ? c.outputs.output : [c.outputs.output]) : [],
      serverPorts: c.server_ports ?
        (Array.isArray(c.server_ports.server_port) ? c.server_ports.server_port : [c.server_ports.server_port]) : [],
    }
    const erik = [...data.outputs, ...data.clientPorts]
    // console.log(erik)
    nodes.push({ data })
    components.push(data)
  }
  // const xmlOutput = xmlBuilder.create(components.component[0]).end({ pretty: true })
  // console.log(xmlOutput)
  // writeFileSync(__dirname + "/test.xml", xmlOutput.toString())

  components.forEach((sender) => {
    for (const output of [...sender.outputs, ...sender.clientPorts]) {
      components.forEach((receiver) => {
        for (const input of [...receiver.inputs, ...receiver.serverPorts]) {
          if (sender !== receiver && (output.type === input.type || output.port_definition === input.port_definition)) {
            edges.push({
              classes: "possibleEdge",
              data: { source: sender.id, target: receiver.id, type: output.name },
              style: {
                "label": output.name.replace(/_/g, " "),
                "target-arrow-shape": "circle",
              },
            })
            return
          }
        }
      })
    }
  })
      // components.component.filter((c) => c[outputs]).forEach((sender) => {
      //   let outputArray = sender[outputs][outputs.slice(0, outputs.length - 1)]
      //   outputArray = Array.isArray(outputArray) ? outputArray : [outputArray]
      //   for (const output of outputArray) {
      //     components.component.filter((c) => c[inputs]).forEach((receiver) => {
      //       let inputArray = receiver[inputs][inputs.slice(0, inputs.length - 1)]
      //       inputArray = Array.isArray(inputArray) ? inputArray : [inputArray]
      //       for (const input of inputArray) {
      //         if (output[type] === input[type] && receiver !== sender) {
      //           edges.push({
      //             classes: "possibleEdge",
      //             data: { source: sender.name, target: receiver.name, type: output.name },
      //             style: {
      //               "label": output.name.replace(/_/g, " "),
      //               "target-arrow-shape": shape,
      //             },
      //           })
      //           return
      //         }
      //       }
      //     })
      //   }
      // })
      // function createEdges(outputs: string, inputs: string, type: string, shape: string) {
      //   components.component.filter((c) => c[outputs]).forEach((sender) => {
      //     let outputArray = sender[outputs][outputs.slice(0, outputs.length - 1)]
      //     outputArray = Array.isArray(outputArray) ? outputArray : [outputArray]
      //     for (const output of outputArray) {
      //       components.component.filter((c) => c[inputs]).forEach((receiver) => {
      //         let inputArray = receiver[inputs][inputs.slice(0, inputs.length - 1)]
      //         inputArray = Array.isArray(inputArray) ? inputArray : [inputArray]
      //         for (const input of inputArray) {
      //           if (output[type] === input[type] && receiver !== sender) {
      //             edges.push({
      //               classes: "possibleEdge",
      //               data: { source: sender.name, target: receiver.name, type: output.name },
      //               style: {
      //                 "label": output.name.replace(/_/g, " "),
      //                 "target-arrow-shape": shape,
      //               },
      //             })
      //             return
      //           }
      //         }
      //       })
      //     }
      //   })
      // }
      // createEdges("outputs", "inputs", "type", "triangle")
      // createEdges("client_ports", "server_ports", "port_definition", "circle")

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
              "content"(ele) {
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
              // "events": "no",
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
        cancel: (source) => source.unselect(),
        complete: (source, target: cytoscape.NodeCollection, edge) => {
          if (!edge.style("label")) {
            edge.remove()
          }
          console.log(source, target)
          // source.data("outputs").output.forEach((output) => console.log(output))
          console.log(source.data("outputs"))

          source.unselect()
          target.select()
        },
        previewoff: (source, target) => {
          source.edgesTo(target).filter(".possibleEdge").style("display", "element")
          cy.edges(".eh-ghost-edge").style("display", "element")
        },
        previewon: (source, target) => {
          cy.edges(".eh-ghost-edge").style("display", "none")
          source.edgesTo(target).filter(".possibleEdge").style("display", "none")
          const firstEdge = source.edgesTo(target).first()
          const lastEdge = source.edgesTo(target).last()
          lastEdge.style("target-arrow-shape", firstEdge.style("target-arrow-shape"))
          lastEdge.style("label", firstEdge.style("label"))
        },
      })
  eh.enableDrawMode()

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
