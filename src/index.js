import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import cxtmenu from 'cytoscape-cxtmenu'

cytoscape.use( edgehandles )
cytoscape.use( cxtmenu )

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

    cy.nodes('[id = "red"]').style('background-color', '#c51111')
    cy.nodes('[id = "blue"]').style('background-color', '#132ed1')
    cy.nodes('[id = "green"]').style('background-color', '#117f2d')
    cy.nodes('[id = "pink"]').style('background-color', '#ed54ba')
    cy.nodes('[id = "orange"]').style('background-color', '#ef7d0e')
    cy.nodes('[id = "yellow"]').style('background-color', '#F6F658')
    cy.nodes('[id = "black"]').style('background-color', '#3f474e')
    cy.nodes('[id = "white"]').style('background-color', '#d6e0f0')
    cy.nodes('[id = "white"]').style('border-color', 'black')
    cy.nodes('[id = "white"]').style('border-width', '1')
    cy.nodes('[id = "purple"]').style('background-color', '#6b31bc')
    cy.nodes('[id = "brown"]').style('background-color', '#71491e')
    cy.nodes('[id = "cyan"]').style('background-color', '#38fedb')
    cy.nodes('[id = "lime"]').style('background-color', '#50ef39')

    cy.cxtmenu({
        selector: 'node',
        commands: [
            
        ]
    })

    return cy
}