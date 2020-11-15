import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'

cytoscape.use( edgehandles )

window.initialize = function initialize(container) {
    let cy = cytoscape({
        container: container,
        layout: {
            name: 'circle',
            fit: true,
            spacingFactor: 0.5
        },
        style: [
            {
                selector: 'node[name]',
                style: {
                    'content': 'data(name)'
                }
            },

            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle'
                }
            },

            // some style for the extension

            {
                selector: '.eh-handle',
                style: {
                    'background-color': 'red',
                    'width': 12,
                    'height': 12,
                    'shape': 'ellipse',
                    'overlay-opacity': 0,
                    'border-width': 12, // makes the handle easier to hit
                    'border-opacity': 0
                }
            },

            {
                selector: '.eh-hover',
                style: {
                    'background-color': 'red'
                }
            },

            {
                selector: '.eh-source',
                style: {
                    'border-width': 2,
                    'border-color': 'red'
                }
            },

            {
                selector: '.eh-target',
                style: {
                    'border-width': 2,
                    'border-color': 'red'
                }
            },

            {
                selector: '.eh-preview, .eh-ghost-edge',
                style: {
                    'background-color': 'red',
                    'line-color': 'red',
                    'target-arrow-color': 'red',
                    'source-arrow-color': 'red'
                }
            },

            {
                selector: '.eh-ghost-edge.eh-preview-active',
                style: {
                    'opacity': 0
                }
            }
        ],

        elements: {
            nodes: [
                { data: { id: 'red', name: 'Red' } },
                { data: { id: 'blue', name: 'Blue' } },
                { data: { id: 'green', name: 'Green' } },
                { data: { id: 'pink', name: 'Pink' } },
                { data: { id: 'orange', name: 'Orange' } },
                { data: { id: 'yellow', name: 'Yellow' } },
                { data: { id: 'black', name: 'Black' } },
                { data: { id: 'white', name: 'White' } },
                { data: { id: 'purple', name: 'Purple' } },
                { data: { id: 'brown', name: 'Brown' } },
                { data: { id: 'cyan', name: 'Cyan' } },
                { data: { id: 'lime', name: 'Lime' } }
            ],
            edges: [
            ]
        }
    })

    cy.nodes('[id = "red"]').style('background-color', 'red')
    cy.nodes('[id = "blue"]').style('background-color', 'blue')
    cy.nodes('[id = "green"]').style('background-color', 'green')
    cy.nodes('[id = "pink"]').style('background-color', 'pink')
    cy.nodes('[id = "orange"]').style('background-color', 'orange')
    cy.nodes('[id = "yellow"]').style('background-color', 'yellow')
    cy.nodes('[id = "black"]').style('background-color', 'black')
    cy.nodes('[id = "white"]').style('background-color', 'white')
    cy.nodes('[id = "white"]').style('border-color', 'black')
    cy.nodes('[id = "white"]').style('border-width', '1')
    cy.nodes('[id = "purple"]').style('background-color', 'purple')
    cy.nodes('[id = "brown"]').style('background-color', 'brown')
    cy.nodes('[id = "cyan"]').style('background-color', 'cyan')
    cy.nodes('[id = "lime"]').style('background-color', 'lime')

    return cy
}