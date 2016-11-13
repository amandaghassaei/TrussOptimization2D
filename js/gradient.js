/**
 * Created by ghassaei on 11/11/16.
 */


function initGradientSolver(globals){

    var solver = new Solver();

    var arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(), 1, 0xff00ff);
    arrow.line.material.linewidth = 4;
    globals.threeView.sceneAdd(arrow);
    hide();

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
        $("#resetOptimization").hide();
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
    function calcGrad(linked, callback, node, _position){
        syncPosition();

        if (_position) arrow.position.set(_position.x, _position.y, _position.z);
        if (node === undefined) node = linked[0];

        var stepSize = globals.gradStepSize;

        var indices = [];
        for (var i = 0; i < linked.length; i++) {
            var index = globals.nodes.indexOf(linked[i]);
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
            for (var i = 0; i < linked.length; i++) {
                var position = node.getPosition();
                if (j<coordinates.length) position[coordinates[j%2]] += stepSize;
                else position[coordinates[j%2]] -= stepSize;
                if (linked[i] != node){
                    position = globals.linked.getSymmetricPosition(position);
                }
                newPositions.push(position);
            }
            _grad(indices, newPositions, outputPos, outputNeg, coordinates[j%2], j<coordinates.length, numSolved, node, callback);
        }
    }

    function _grad(indices, positions, outputPos, outputNeg, axis, sign, numSolved, node, callback){
        for (var i=0;i<indices.length;i++){
            nodes[indices[i]].position = positions[i];
        }
        solver.resetK_matrix();
        solver.solve(nodes, edges, globals.xyOnly, function(internalForces, freeEdges){
            var sumFL = 0;
            for (var i=0;i<freeEdges.length;i++){
                var edge = edges[freeEdges[i]];
                sumFL += Math.abs(internalForces[i])*edge.getLength();
            }
            var val = 1-sumFL/globals.sumFL;
            if (val > 0){
                if (sign) outputPos[axis] = val;
                else outputNeg[axis] = val;
            }
            numSolved[0]++;
            var numToSolve = 6;
            if (globals.xyOnly) numToSolve = 4;
            if (numSolved[0] == numToSolve){
                var output = outputPos.clone().sub(outputNeg);
                var length = output.length();
                var dir = output.normalize();

                if (callback){
                    var directions = [dir.clone().multiplyScalar(globals.gradStepSize)];
                    directions.push(directions[0].clone());
                    //todo does this make sense?
                    if (globals.nodes[indices[0]] == node) directions[1] = globals.linked.getSymmetricPosition(directions[1]);
                    else directions[0] = globals.linked.getSymmetricPosition(directions[0]);
                    callback(directions);
                } else {
                    length *= 100/globals.gradStepSize;
                    arrow.setDirection(dir);
                    arrow.visible = !(length < 0.001);
                    if (length<1.1) {//prevent arrow from having zero length
                        length = 1.1;
                    }
                    arrow.setLength(length, 1, 1);
                }
            }
        });
    }

    syncNodes();

    function resetF_matrix(){
        solver.resetF_matrix();
    }

    function hide(){
        arrow.visible = false;
    }

    var originalPositions = [];
    function saveOriginalPositions(){
        originalPositions = [];
        for (var i=0;i<globals.nodes.length;i++){
            originalPositions.push(globals.nodes[i].getPosition());
        }
    }

    function startOptimization(){

        saveOriginalPositions();
        for (var i=0;i<globals.linked.linked.length;i++){
            if (globals.linked.linked[i].length == 2){
                globals.linked.linked[i][1].moveManually(globals.linked.getSymmetricPosition(globals.linked.linked[i][0].getPosition()));
            }
        }
        globals.solver.resetK_matrix();
        globals.solver.solve();

        var linkedNum = 0;
        var lastFL = globals.sumFL;
        $("#optimize").blur();
        hide();
        globals.threeView.startAnimation(function(){

            lastFL = globals.sumFL;

            for (var j=0;j<globals.linked.linked.length;j++){
                var currentLinked = globals.linked.linked[j];
                calcGrad(currentLinked, function(directions){
                    for (var i=0;i<currentLinked.length;i++){
                        currentLinked[i].moveManually(currentLinked[i].getPosition().add(directions[i]));
                    }
                    globals.solver.resetK_matrix();
                    globals.solver.solve();
                });
            }

            globals.controls.viewModeCallback();
            if (lastFL-globals.sumFL < globals.gradTolerance){
                pauseOptimization();
            }
        });
    }
    function pauseOptimization(){
        globals.threeView.stopAnimation();
        $("#pauseOptimization").hide();
        $("#optimize").show();
        $("#resetOptimization").show();
    }
    function resetOptimization(){
        for (var i=0;i<originalPositions.length;i++) {
            globals.nodes[i].moveManually(originalPositions[i]);
        }
        globals.solver.resetK_matrix();
        globals.solver.solve();
        globals.controls.viewModeCallback();
        $("#resetOptimization").hide();
    }

    return {
        syncNodes: syncNodes,
        syncFixed: syncFixed,
        calcGrad: calcGrad,
        resetF_matrix: resetF_matrix,
        hide: hide,
        startOptimization: startOptimization,
        pauseOptimization: pauseOptimization,
        resetOptimization: resetOptimization
    }
}