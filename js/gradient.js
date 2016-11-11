/**
 * Created by ghassaei on 11/11/16.
 */


function initGradientSolver(globals){

    var linked = globals.linked.linked;

    var solver = new Solver();

    var arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(), 1, 0xff00ff);
    arrow.line.material.linewidth = 4;
    globals.threeView.sceneAdd(arrow);

    var nodes = [];
    var edges = [];

    function syncNodes(){

        for (var i=0;i<nodes.length;i++){
            nodes[i].externalForce = null;
            nodes[i].beams = null;
            nodes[i].position = null;
        }
        for (var i=0;i<edges.length;i++){
            edges[i].nodes = null;
        }
        nodes = [];
        edges = [];

        for (var i=0;i<globals.nodes.length;i++){
            nodes.push(globals.nodes[i].clone());
        }
        for (var i=0;i<globals.edges.length;i++){
            var edge = globals.edges[i];
            var edgeNodes = [];
            for (var j=0;j<edge.nodes.length;j++){
                var index = globals.nodes.indexOf(edge.nodes[j]);
                if (index<0) {
                    console.warn("no node found");
                    continue;
                }
                edgeNodes.push(nodes[index]);
            }
            edges.push(new Beam(edgeNodes, globals, true));
        }
        solver.resetF_matrix();
    }

    function syncFixed(){
        for (var i=0;i<nodes.length;i++){
            nodes[i].fixed = globals.nodes[i].fixed
        }
        solver.resetK_matrix();
        solver.resetF_matrix();
    }
    function syncPosition(){
        for (var i=0;i<nodes.length;i++){
            nodes[i].position = globals.nodes[i].getPosition();
        }
    }

    var coordinates = ["x", "y", "z"];
    if (globals.xyOnly) coordinates = ["x", "y"];
    function calcGrad(variableNodes, position){
        syncPosition();

        arrow.position.set(position.x, position.y, position.z);

        var stepSize = globals.gradStepSize;

        var indices = [];
        for (var i = 0; i < variableNodes.length; i++) {
            var index = globals.nodes.indexOf(variableNodes[i]);
            if (index < 0) {
                console.warn("node not found");
                return;
            }
            indices.push(index);
        }

        var outputPos = new THREE.Vector3();
        var outputNeg = new THREE.Vector3();
        var numSolved = [0];
        for (var j=0;j<coordinates.length*2;j++) {
            var newPositions = [];
            for (var i = 0; i < variableNodes.length; i++) {
                var position = variableNodes[i].getPosition();
                if (j<coordinates.length) position[coordinates[j%2]] += stepSize;
                else position[coordinates[j%2]] -= stepSize;
                newPositions.push(position);
                _grad(indices, newPositions, outputPos, outputNeg, coordinates[j%2], j<coordinates.length, numSolved);
            }
        }
    }

    function _grad(indices, positions, outputPos, outputNeg, axis, sign, numSolved){
        for (var i=0;i<indices.length;i++){
            nodes[i].position = positions[i];
        }
        solver.resetK_matrix();
        solver.resetF_matrix();
        solver.solve(nodes, edges, globals.xyOnly, function(internalForces, freeEdges){
            var sumFL = 0;
            for (var i=0;i<freeEdges.length;i++){
                var edge = edges[freeEdges[i]];
                sumFL += Math.abs(internalForces[i])*edge.getLength();
            }
            if (sign) outputPos[axis] = 1-sumFL/globals.sumFL;
            else outputNeg[axis] = 1-sumFL/globals.sumFL;
            numSolved[0]++;
            var numToSolve = 6;
            if (globals.xyOnly) numToSolve = 4;
            if (numSolved[0] == numToSolve){
                var output = outputPos.clone().add(outputNeg);
                //console.log(outputPos);
                //console.log(output);
                var length = output.length()*10;
                var dir = output.normalize();
                arrow.setDirection(dir);
                if (length<1.1) length = 1.1;//prevent arrow from having zero length
                arrow.setLength(length, 1, 1);
            }
        });
    }

    syncNodes();

    function resetF_matrix(){
        solver.resetF_matrix();
    }

    return {
        syncNodes: syncNodes,
        syncFixed: syncFixed,
        calcGrad: calcGrad,
        resetF_matrix: resetF_matrix
    }
}