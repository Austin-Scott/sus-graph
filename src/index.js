import cytoscape from 'cytoscape'
import edgehandles from 'cytoscape-edgehandles'
import cxtmenu from 'cytoscape-cxtmenu'
import popper from 'cytoscape-popper'

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

const KeyboardColorShortcuts = {
    r: 'red',
    b: 'blue',
    g: 'green',
    o: 'orange',
    y: 'yellow',
    w: 'white',
    c: 'cyan',
    l: 'lime',
    i: 'pink',
    a: 'black',
    u: 'purple',
    n: 'brown'
}

const PlayerColorValues = {
    red: '#c51111',
    blue: '#132ed1',
    green: '#117f2d',
    pink: '#ed54ba',
    orange: '#ef7d0e',
    yellow: '#F6F658',
    black: '#3f474e',
    white: '#d6e0f0',
    purple: '#6b31bc',
    brown: '#71491e',
    cyan: '#38fedb',
    lime: '#50ef39'
}

const Players = {}

// Assumes the node has already been created and that player color = colorId
function createPlayer(colorId, cy) {
    let node = cy.nodes(`[id = "${colorId}"]`)

    node.style('background-color', PlayerColorValues[colorId])
    if (colorId == 'white') {
        node.style('border-color', 'black')
        node.style('border-width', '1')
    }

    let player = {
        node: node,
        inBoundEdges: [],
        outBoundEdges: [],
        active: false,
        alive: true,
        role: 'unknown',
        colorId: colorId,
        tippy: null,

        setOrUpdateTooltip() {

            const stateText = `${this.alive ? '' : 'Dead, '}${this.role}`
            if (this.tippy != null) {
                this.tippy.destroy()
            }

            if (this.alive && this.role == 'unknown') {
                return
            }

            this.tippy = makeTippy(this.node, stateText)
            this.tippy.show()

        },
        delete() {
            if(this.tippy != null) {
                this.tippy.destroy()
            }
            this.node.cy().remove(this.node)
        },
        toggleDead() {
            this.alive = !this.alive
            this.setOrUpdateTooltip()
        },
        markUnknown() {
            this.role = 'unknown'
            this.setOrUpdateTooltip()
        },
        markInposter() {
            this.role = 'imposter'
            this.setOrUpdateTooltip()
        },
        markCrewmate() {
            this.role = 'crewmate'
            this.setOrUpdateTooltip()
        }
    }

    Players[colorId] = player
}

function deletePlayer(colorId) {
    getPlayer(colorId).delete()
    Players[colorId] = null
}

function getPlayer(colorId) {
    return Players[colorId]
}


function removeElementTooltipIfNeeded(ele) {
    if (ele.tippy != undefined) {
        ele.tippy.destroy()
    }
}

function setOrUpdateEdgeTooltip(ele, sus, reason) {
    let state = {
        sus: sus,
        reason: reason
    }
    const stateText = state.reason
    if (ele.tippy != undefined) {
        ele.tippy.destroy()
    }

    if (state.sus) {
        ele.style('target-arrow-color', 'red')
        ele.style('line-color', 'red')
    } else {
        ele.style('target-arrow-color', 'green')
        ele.style('line-color', 'green')
    }

    if (state.reason == 'sus' || state.reason == 'not sus') {
        return
    }

    ele.tippy = makeTippy(ele, stateText)
    ele.tippy.show()
}

window.onEdgeAdd = function onEdgeAdd(ele) {

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
                    'target-arrow-shape': 'triangle',
                    'line-color': 'red',
                    'target-arrow-color': 'red'
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

    createPlayer('red', cy)
    createPlayer('blue', cy)
    createPlayer('green', cy)
    createPlayer('pink', cy)
    createPlayer('orange', cy)
    createPlayer('yellow', cy)
    createPlayer('black', cy)
    createPlayer('white', cy)
    createPlayer('purple', cy)
    createPlayer('brown', cy)
    createPlayer('cyan', cy)
    createPlayer('lime', cy)

    cy.cxtmenu({
        selector: 'node',
        commands: [
            {
                content: 'Toggle Dead',
                select: function (ele) {
                    let colorId = ele.id()
                    if (Object.keys(PlayerColorValues).includes(colorId)) {
                        getPlayer(colorId).toggleDead()
                    }
                }
            },
            {
                content: 'Mark imposter',
                select: function (ele) {
                    let colorId = ele.id()
                    if (Object.keys(PlayerColorValues).includes(colorId)) {
                        getPlayer(colorId).markInposter()
                    }
                }
            },
            {
                content: 'Mark crewmate',
                select: function (ele) {
                    let colorId = ele.id()
                    if (Object.keys(PlayerColorValues).includes(colorId)) {
                        getPlayer(colorId).markCrewmate()
                    }
                }
            },
            {
                content: 'Mark unknown',
                select: function (ele) {
                    let colorId = ele.id()
                    if (Object.keys(PlayerColorValues).includes(colorId)) {
                        getPlayer(colorId).markUnknown()
                    }
                }
            },
            {
                content: 'Delete',
                select: function (ele) {
                    let colorId = ele.id()
                    if (Object.keys(PlayerColorValues).includes(colorId)) {
                        deletePlayer(colorId)
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
                    setOrUpdateEdgeTooltip(ele, true, 'sus')
                }
            },
            {
                content: 'Saw kill/vent',
                select: function (ele) {
                    setOrUpdateEdgeTooltip(ele, true, 'kill/vent')
                }
            },
            {
                content: 'Saw fake task',
                select: function (ele) {
                    setOrUpdateEdgeTooltip(ele, true, 'fake task')
                }
            },
            {
                content: 'Did not report body',
                select: function (ele) {
                    setOrUpdateEdgeTooltip(ele, true, 'did not report')
                }
            },
            {
                content: 'Not sus',
                select: function (ele) {
                    setOrUpdateEdgeTooltip(ele, false, 'not sus')
                }
            },
            {
                content: 'Visually confirmed not sus',
                select: function (ele) {
                    setOrUpdateEdgeTooltip(ele, false, 'confirmed')
                }
            },
            {
                content: 'Delete',
                select: function (ele) {
                    removeElementTooltipIfNeeded(ele)
                    cy.remove(ele)
                }
            }
        ]
    })

    return cy
}