/**
 * Created by ghassaei on 10/31/16.
 */


function initGlobals(){

    var _globals = {

        //edit geo
        addForceMode: false,
        addRemoveFixedMode: false,
        deleteMode: false,

        viewMode: "geometry",

        lockForces: false,
        lockTopology: false,
        lockNodePositions: false,

        nodes : [],
        addNode: addNode,
        removeNode: removeNode,
        edges: [],
        addEdge: addEdge,
        removeEdge: removeEdge
    };


    function addNode(node){
        _globals.nodes.push(node);
    }
    function removeNode(node){
        //if (_globals.nodes.length < 2) return;
        var index = _globals.nodes.indexOf(node);
        if (index>=0) _globals.nodes.splice(index, 1);
        node.destroy();
    }

    function addEdge(edge){
        _globals.edges.push(edge);
    }
    function removeEdge(edge){
        //if (_globals.edges.length == 1) return;
        var index = _globals.edges.indexOf(edge);
        if (index>=0) _globals.edges.splice(index, 1);
        edge.destroy();
    }

    _globals.threeView = initThreeView(_globals);
    _globals.controls = initControls(_globals);
    _globals.solver = initSolver(_globals);

    return _globals;
}