import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import cxtmenu from 'cytoscape-cxtmenu'
import PopperJs from 'popper.js'
import popper from 'cytoscape-popper'
import tippy from 'tippy.js'

cytoscape.use(edgehandles)
cytoscape.use(cxtmenu)
cytoscape.use(popper)

function makeTippy(node, text) {
    var ref = node.popperRef()
    // unfortunately, a dummy element must be passed
    // as tippy only accepts a dom element as the target
    // https://github.com/atomiks/tippyjs/issues/661
    var dummyDomEle = document.createElement('div');

    var tip = tippy(dummyDomEle, {
        onCreate: function (instance) { // mandatory
            // patch the tippy's popper reference so positioning works
            // https://atomiks.github.io/tippyjs/misc/#custom-position
            instance.popperInstance.reference = ref;
        },
        lazy: false, // mandatory
        trigger: 'manual', // mandatory

        // dom element inside the tippy:
        content: function () { // function can be better for performance
            var div = document.createElement('div');

            div.innerHTML = text;

            return div;
        },

        // your own preferences:
        arrow: true,
        placement: 'bottom',
        hideOnClick: false,
        multiple: true,
        sticky: true,

        // if interactive:
        interactive: true,
        appendTo: document.body // or append dummyDomEle to document.body
    })

    return tip
}

function setOrUpdateNodeTooltip(cy, ele) {
    const stateText = `${ele.state.alive?'Alive':'Dead'}, ${ele.state.role}`
    const node = cy.getElementById(ele.data('id'))
    if(ele.tippy == undefined) {
        ele.tippy = makeTippy(node, stateText)
        ele.tippy.show()
    } else {

    }
}

function removeNodeTooltipIfNeeded(ele) {

}

window.initialize = function initialize(container) {
    let cy = cytoscape({
        container: container,
        layout: {
            name: 'circle',
            fit: true,
            padding: 115,
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
                { data: { id: 'red' } },
                { data: { id: 'blue' } },
                { data: { id: 'green' } },
                { data: { id: 'pink' } },
                { data: { id: 'orange' } },
                { data: { id: 'yellow' } },
                { data: { id: 'black' } },
                { data: { id: 'white' } },
                { data: { id: 'purple' } },
                { data: { id: 'brown' } },
                { data: { id: 'cyan' } },
                { data: { id: 'lime' } }
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

    cy.nodes().forEach(node => {
        node.state = {
            alive: true,
            role: 'unknown'
        }
    })

    cy.cxtmenu({
        selector: 'node',
        commands: [
            {
                content: 'Mark Dead',
                select: function (ele) {
                    if (ele.state) {
                        ele.state.alive = false
                        setOrUpdateNodeTooltip(cy, ele)
                    }
                }
            },
            {
                content: 'Mark imposter',
                select: function (ele) {
                    if (ele.state) {
                        ele.state.role = 'imposter'
                        setOrUpdateNodeTooltip(cy, ele)
                    }
                }
            },
            {
                content: 'Mark crewmate',
                select: function (ele) {
                    if (ele.state) {
                        ele.state.role = 'crewmate'
                        setOrUpdateNodeTooltip(cy, ele)
                    }
                }
            },
            {
                content: 'Mark unknown',
                select: function (ele) {
                    if (ele.state) {
                        ele.state.role = 'unknown'
                        setOrUpdateNodeTooltip(cy, ele)
                    }
                }
            },
            {
                content: 'Delete',
                select: function (ele) {
                    if (ele.state) {
                        removeNodeTooltipIfNeeded(ele)
                        cy.remove(ele)
                    }
                }
            }
        ]
    })

    cy.cxtmenu({
        selector: 'edge',
        commands: [
            {
                content: 'Sus',
                select: function (ele) {

                }
            },
            {
                content: 'Saw kill/vent',
                select: function (ele) {

                }
            },
            {
                content: 'Saw fake task',
                select: function (ele) {

                }
            },
            {
                content: 'Not sus',
                select: function (ele) {

                }
            },
            {
                content: 'Visually confirmed not sus',
                select: function (ele) {

                }
            },
            {
                content: 'Delete',
                select: function (ele) {
                    cy.remove(ele)
                }
            }
        ]
    })

    return cy
}