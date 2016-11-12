/**
 * Created by ghassaei on 10/31/16.
 */


function initGlobals(){

    var _globals = {

        //edit geo
        addForceMode: false,
        addRemoveFixedMode: false,
        deleteMode: false,

        viewMode: "force",
        xyOnly: true,

        gradStepSize: 0.1,
        gradTolerance: 0.000001,
        sumFL: 0,

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
        _globals.gradient.syncNodes();
    }
    function removeNode(node){
        //if (_globals.nodes.length < 2) return;
        var index = _globals.nodes.indexOf(node);
        if (index>=0) _globals.nodes.splice(index, 1);
        _globals.linked.deleteNode(node);
        node.destroy();
        _globals.gradient.syncNodes();
    }

    function addEdge(edge){
        _globals.edges.push(edge);
        _globals.gradient.syncNodes();
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
    _globals.linked = initLinked(_globals);
    _globals.gradient = initGradientSolver(_globals);

    return _globals;
}