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

    function setModel(nodes, edges, forces, fixed){
        this.clear();
        _.each(nodes, function(pos, i){
            //todo everything on z==0
            var position = new THREE.Vector3(pos[0], pos[1], 0);
            var node = new Node(position, globals);
            if (forces.length>i && forces[i]){
                var force = forces[i];
                if (force.length == 2) force.push(0);
                if (force.length != 3) console.warn("bad force " + JSON.stringify(force));
                node.addExternalForce(new Force(new THREE.Vector3(force[0],force[1],0), globals));
            }
            if (fixed.length>i && fixed[i]){
                node.setFixed(true);
            }
            globals.addNode(node);
        });
        _.each(edges, function(connection){
            var edge = new Beam([globals.nodes[connection[0]], globals.nodes[connection[1]]], globals);
            globals.addEdge(edge);
        });

        globals.gradient.sync();
        globals.solver.solve();
        globals.threeView.render();
    }
    _globals.setModel = setModel;

    function getInfo(){
        var data = {};
        var nodes = _globals.nodes;
        var edges = _globals.edges;

        data.numNodes = nodes.length;
        data.nodes = [];
        data.externalForces = [];
        _.each(nodes, function(node){
            var position = node.getPosition().clone();
            if (node.externalForce) {
                var externalForce = node.getExternalForce();
                data.externalForces.push([externalForce.x, externalForce.y, externalForce.z]);
            } else {
                data.externalForces.push(null);
            }
            data.nodes.push([position.x, position.y, position.z]);
        });

        data.fixedNodes = [];
        _.each(nodes, function(node){
            data.fixedNodes.push(node.fixed);
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
        for (var i=0;i<_globals.edges.length;i++){
            _globals.edges[i].destroy();
        }
        _globals.edges = [];
        for (var i=0;i<_globals.nodes.length;i++){
            _globals.linked.deleteNode(_globals.nodes[i]);
        }
        for (var i=0;i<_globals.nodes.length;i++){
            _globals.nodes[i].destroy();
        }
        _globals.nodes = [];
        _globals.gradient.sync();
        _globals.threeView.render();
    }
    _globals.clear = clear;

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