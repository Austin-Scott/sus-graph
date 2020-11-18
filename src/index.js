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
            if (this.tippy != null) {
                this.tippy.destroy()
            }
            this.node.cy().remove(this.node)
        },
        toggleDead() {
            this.active = true
            this.alive = !this.alive
            this.setOrUpdateTooltip()
            computeSusLevels()
        },
        markDead() {
            this.active = true
            this.alive = false
            this.setOrUpdateTooltip()
            computeSusLevels()
        },
        markActive() {
            this.active = true
        },
        markUnknown() {
            this.active = true
            this.role = 'unknown'
            this.setOrUpdateTooltip()
            computeSusLevels()
        },
        markInposter() {
            this.active = true
            this.role = 'imposter'
            this.setOrUpdateTooltip()
            computeSusLevels()
        },
        markCrewmate() {
            this.active = true
            this.role = 'crewmate'
            this.setOrUpdateTooltip()
            computeSusLevels()
        }
    }

    Players[colorId] = player
}

function deletePlayer(colorId) {
    getPlayer(colorId).delete()
    Players[colorId] = null
    computeSusLevels()
}

function getPlayer(colorId) {
    return Players[colorId]
}

const Edges = {}
let recentEdges = []

// Assuming that edge is already created on map, just adding to local model
function createEdge(cy, fromId, toId, id) {
    let e = cy.edges(`[id = "${id}"]`)

    let playerFrom = getPlayer(fromId)
    let playerTo = getPlayer(toId)

    let edge = {
        id: id,
        edge: e,
        sus: true,
        susLevel: 1,
        reason: 'sus',
        playerFrom: playerFrom,
        playerTo: playerTo,
        tippy: null,

        setOrUpdateTooltip(sus, reason) {
            const stateText = reason
            if (this.tippy != null) {
                this.tippy.destroy()
            }

            if (sus) {
                if (reason == 'sus' || reason == 'sus w evidence') {
                    this.setColor('#FF0000')
                } else if (reason == 'bandwagon') {
                    this.setColor('#FF00FF')
                } else {
                    this.setColor('#000000')
                }
            } else {
                this.setColor('#00FF00')
            }

            if (reason == 'sus' || reason == 'not sus' || reason == 'bandwagon') {
                return
            }

            this.tippy = makeTippy(this.edge, stateText)
            this.tippy.show()

        },
        setColor(color) {
            this.edge.style('target-arrow-color', color)
            this.edge.style('line-color', color)
        },
        changeSus(sus, reason, level) {
            this.sus = sus
            this.reason = reason
            this.susLevel = level
            this.setOrUpdateTooltip(sus, reason)
            computeSusLevels()
        },
        delete() {
            this.playerFrom.outBoundEdges = this.playerFrom.outBoundEdges.filter(edge => {
                return edge.id != this.id
            })
            this.playerTo.inBoundEdges = this.playerTo.inBoundEdges.filter(edge => {
                return edge.id != this.id
            })

            if (this.tippy != null) {
                this.tippy.destroy()
            }

            this.edge.cy().remove(this.edge)
        }
    }

    Edges[id] = edge
    recentEdges.push(edge)
    playerFrom.outBoundEdges.push(edge)
    playerTo.inBoundEdges.push(edge)

    playerFrom.markActive()
    playerTo.markActive()
    computeSusLevels()
}

function getLastEdge() {
    if (recentEdges.length == 0) return null
    return recentEdges[recentEdges.length - 1]
}

function deleteLastEdge() {
    let lastEdge = getLastEdge()
    if (lastEdge != null) {
        deleteEdge(lastEdge.id)
    }
}

function getEdge(id) {
    return Edges[id]
}

function computeSusLevels() {
    let candidates = Object.values(Players).filter(player => {
        if(!player) return false
        if(!player.active) return false
        if(!player.alive) return false
        if(!player.role == 'crewmate') return false

        return true
    })
    let results = candidates.map(player => {
        let susLevel = player.inBoundEdges.reduce((sum, edge)=>{
            let playerFrom = edge.playerFrom
            if(playerFrom.role == 'unknown') {
                return sum+edge.susLevel
            } else if(playerFrom.role == 'crewmate') {
                return sum+(2*edge.susLevel)
            } else {
                if(edge.sus) {
                    return sum-edge.susLevel
                } else {
                    return sum-(0.5*edge.susLevel)
                }
            }
        }, 0)
        susLevel += player.outBoundEdges.reduce((sum, edge)=>{
            let playerTo = edge.playerTo
            if(playerTo.role == 'unknown') {
                if(edge.sus) {
                    return sum+(0.5*edge.susLevel)
                } else {
                    return sum+(0.25*edge.susLevel)
                }
            } else if(playerTo.role == 'crewmate') {
                if(edge.sus) {
                    return sum+(2*edge.susLevel)
                } else {
                    return sum+(0.3*edge.susLevel)
                }
            } else {
                return sum-edge.susLevel
            }
        }, 0)
        return {
            color: player.colorId,
            susLevel: susLevel
        }
    })
    results.sort((a, b)=>b.susLevel-a.susLevel)
    
    let susList = document.getElementById('susList')
    susList.innerHTML = `<strong>Most suspicious colors:</strong><ol>${results.reduce((a, result)=>a+`<li>${result.color}</li>`, '')}</ol>`
}

function deleteEdge(id) {
    let edge = getEdge(id)
    edge.delete()
    recentEdges = recentEdges.filter(e => {
        return e.id != id
    })
    Edges[id] = null
    computeSusLevels()
}

window.onEdgeAdd = function onEdgeAdd(cy, source, target, ele) {
    createEdge(cy, source.id(), target.id(), ele.id())
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
                    let edge = getEdge(ele.id())
                    edge.changeSus(true, 'sus', 1)
                }
            },
            {
                content: 'Saw kill/vent',
                select: function (ele) {
                    let edge = getEdge(ele.id())
                    edge.changeSus(true, 'kill/vent', 5)
                }
            },
            {
                content: 'Sus w evidence',
                select: function (ele) {
                    let edge = getEdge(ele.id())
                    edge.changeSus(true, 'sus w evidence', 2)
                }
            },
            {
                content: 'B-wagon',
                select: function (ele) {
                    let edge = getEdge(ele.id())
                    edge.changeSus(true, 'bandwagon', 1)
                }
            },
            {
                content: 'Not sus',
                select: function (ele) {
                    let edge = getEdge(ele.id())
                    edge.changeSus(false, 'not sus', -1)
                }
            },
            {
                content: 'Confirmed not sus',
                select: function (ele) {
                    let edge = getEdge(ele.id())
                    edge.changeSus(false, 'confirmed', -5)
                }
            },
            {
                content: 'Delete',
                select: function (ele) {
                    deleteEdge(ele.id())
                }
            }
        ]
    })

    return cy
}

let mode = 'start'
let combo = []

window.keyhandler = function keyhandler(cy, key) {
    let colorKeys = Object.keys(KeyboardColorShortcuts)
    let capitalColorKeys = Object.keys(KeyboardColorShortcuts).map(key => key.toUpperCase())

    if (mode == 'start') {
        if (colorKeys.includes(key)) {
            mode = 'sus'
            combo.push(key)
        } else if(capitalColorKeys.includes(key)) {
            mode = 'bandwagon'
            combo.push(key.toLowerCase())
        } else if (key == 'x') {
            mode = 'exclude'
        } else if (key == 'f') {
            deleteLastEdge()
        } else if (key == 'v') {
            let lastEdge = getLastEdge()
            if (lastEdge != null) {
                lastEdge.changeSus(false, 'not sus', -1)
            }
        } else if (key == 'V') {
            let lastEdge = getLastEdge()
            if (lastEdge != null) {
                lastEdge.changeSus(false, 'confirmed', -5)
            }
            else if (key == 'k') {
                mode = 'kill'
            }
        } else if (key == 'e') {
            let lastEdge = getLastEdge()
            if (lastEdge != null) {
                lastEdge.changeSus(true, 'sus w evidence', 2)
            }
        } else if (key == 'E') {
            let lastEdge = getLastEdge()
            if (lastEdge != null) {
                lastEdge.changeSus(true, 'kill/vent', 5)
            }
        }
        else if (key == 'k') {
            mode = 'kill'
        } else if(key == 'm') {
            mode = 'mark crewmate'
        } else if(key == 'M') {
            mode = 'mark imposter'
        } else if(key == 't') {
            mode = 'toggle dead'
        }
    }
    else if (mode == 'sus') {
        if (colorKeys.includes(key)) {
            let playerFrom = getPlayer(KeyboardColorShortcuts[combo[0]])
            let playerTo = getPlayer(KeyboardColorShortcuts[key])

            if(playerFrom && playerTo) {
                let ele = cy.add({
                    group: 'edges',
                    data: {
                        source: playerFrom.colorId,
                        target: playerTo.colorId
                    }
                })

                createEdge(cy, playerFrom.colorId, playerTo.colorId, ele.id())
            }
        }
        mode = 'start'
        combo = []
    } else if(mode == 'bandwagon') {
        if (capitalColorKeys.includes(key)) {
            let playerFrom = getPlayer(KeyboardColorShortcuts[combo[0]])
            let playerTo = getPlayer(KeyboardColorShortcuts[key.toLowerCase()])

            if(playerFrom && playerTo) {
                let ele = cy.add({
                    group: 'edges',
                    data: {
                        source: playerFrom.colorId,
                        target: playerTo.colorId
                    }
                })

                createEdge(cy, playerFrom.colorId, playerTo.colorId, ele.id())
                getEdge(ele.id()).changeSus(true, 'bandwagon', 1)
            }

        }
        mode = 'start'
        combo = []

    } else if (mode == 'exclude') {
        if (colorKeys.includes(key)) {
            combo.push(key)
        } else if (key == 'x') {
            combo.forEach(currentKey => {
                let player = getPlayer(KeyboardColorShortcuts[currentKey])
                if(player) {
                    player.markActive()
                }
            })
            let inactivePlayers = Object.values(Players).filter(player => {
                return !player.active
            })
            inactivePlayers.forEach(player => {
                deletePlayer(player.colorId)
            })

            mode = 'start'
            combo = []
        } else {
            mode = 'start'
            combo = []
        }
    } else if (mode == 'kill') {
        if (colorKeys.includes(key)) {
            combo.push(key)
        } else if (key == 'k') {
            combo.forEach(currentKey => {
                let player = getPlayer(KeyboardColorShortcuts[currentKey])
                if(player) {
                    player.markDead()
                    player.markCrewmate()
                }
            })

            mode = 'start'
            combo = []
        } else {
            mode = 'start'
            combo = []
        }

    } else if(mode == 'mark crewmate') {
        if(colorKeys.includes(key)) {
            let player = getPlayer(KeyboardColorShortcuts[key])
            if(player) {
                player.markCrewmate()
            }
        }
        mode = 'start'
    } else if(mode == 'mark imposter') {
        if(colorKeys.includes(key)) {
            let player = getPlayer(KeyboardColorShortcuts[key])
            if(player) {
                player.markInposter()
            }
        }
        mode = 'start'
    } else if(mode == 'toggle dead') {
        if(colorKeys.includes(key)) {
            let player = getPlayer(KeyboardColorShortcuts[key])
            if(player) {
                player.toggleDead()
            }
        }
        mode = 'start'
    }
}
