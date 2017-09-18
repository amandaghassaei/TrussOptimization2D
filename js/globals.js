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
        xyOnly: true,

        gradStepSize: 1,
        gradTolerance: 1,
        sumFL: 0,

        symmetryAngle: 90,
        symmetryPoint: new THREE.Vector3(0,0,0),

        lockForces: false,
        lockTopology: false,
        lockNodePositions: false,

        nodes : [],
        addNode: addNode,
        removeNode: removeNode,
        edges: [],
        addEdge: addEdge,
        removeEdge: removeEdge,
        getInfo: getInfo
    };

    function getInfo(){
        var data = {};
        var nodes = _globals.nodes;
        var edges = _globals.edges;

        data.numNodes = nodes.length;
        data.nodes = [];
        data.externalForces = [];
        _.each(nodes, function(node){
            var position = node.getPosition().clone();
            var externalForce = node.getExternalForce();
            data.nodes.push([position.x, position.y, position.z]);
            data.externalForces.push([externalForce.x, externalForce.y, externalForce.z]);
        });

        data.fixedNodesIndices = [];
        _.each(nodes, function(node, index){
            if (node.fixed) data.fixedNodesIndices.push(index);
        });

        data.numEdges = edges.length;
        data.edges = [];
        data.edgeLengths = [];
        _.each(edges, function(edge){
            data.edges.push([nodes.indexOf(edge.nodes[0]), nodes.indexOf(edge.nodes[1])]);
            data.edgeLengths.push(edge.getLength());
        });
        data.sumFL = _globals.sumFL;

        return JSON.stringify(data, null, 2);
    }

    function clear(){

    }

    function addNode(node){
        _globals.nodes.push(node);
        _globals.gradient.sync();
    }
    function removeNode(node){
        //if (_globals.nodes.length < 2) return;
        var index = _globals.nodes.indexOf(node);
        if (index>=0) _globals.nodes.splice(index, 1);
        _globals.linked.deleteNode(node);
        node.destroy();
        _globals.gradient.sync();
    }

    function addEdge(edge){
        _globals.edges.push(edge);
        _globals.gradient.sync();
    }
    function removeEdge(edge){
        //if (_globals.edges.length == 1) return;
        var index = _globals.edges.indexOf(edge);
        if (index>=0) _globals.edges.splice(index, 1);
        edge.destroy();
    }

    function warn(msg){
        if (($("#warningMessage").data('bs.modal') || {}).isShown){
            $("#warningMessage").append("<br/><br/>" + msg);
            return;
        }
        $("#warningMessage").html(msg);
        $("#warningModal").modal("show");
    }
    _globals.warn = warn;

    _globals.threeView = initThreeView(_globals);
    _globals.controls = initControls(_globals);
    _globals.solver = initSolver(_globals);
    _globals.linked = initLinked(_globals);
    _globals.gradient = initGradientSolver(_globals);

    return _globals;
}