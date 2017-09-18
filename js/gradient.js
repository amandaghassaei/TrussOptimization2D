/**
 * Created by ghassaei on 11/11/16.
 */


function initGradientSolver(globals){

    var solver = new Solver();

    var arrow = new Force(new THREE.Vector3(), globals, true);
    arrow.arrow.cone.material.color.setHex(0xff00ff);
    hide();

    var nodes = [];
    var edges = [];

    function sync(){

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
        solver.resetK_matrix();
        solver.resetF_matrix();
        originalPositions = [];
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

        if (_position) arrow.setOrigin(_position);
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
                    if (globals.nodes[indices[0]] == node) directions[1] = globals.linked.getSymmetricPosition(directions[1]);
                    else directions[0] = globals.linked.getSymmetricPosition(directions[0]);
                    callback(directions);
                } else {
                    length *= 20000/globals.gradStepSize;
                    if (length > 50) length = 50;
                    arrow.object3D.visible = !(length < 0.01);
                    arrow.setForce(dir.multiplyScalar(length));
                }
            }
        });
    }

    sync();

    function resetF_matrix(){
        solver.resetF_matrix();
    }

    function hide(){
        arrow.object3D.visible = false;
    }

    var originalPositions = [];
    function saveOriginalPositions(){
        var newPositions = [];
        for (var i=0;i<globals.nodes.length;i++){
            newPositions.push(globals.nodes[i].getPosition());
        }
        originalPositions.push(newPositions);
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

        var lastFL = globals.sumFL;
        $("#optimize").blur();
        hide();
        var numConverged = 0;
        globals.threeView.startAnimation(function(){

            lastFL = globals.sumFL;
            numConverged = 0;

            for (var j=0;j<globals.linked.linked.length;j++){
                if (globals.linked.locked[j][0] && globals.linked.locked[j][1]){
                    continue;
                }
                var currentLinked = globals.linked.linked[j];
                calcGrad(currentLinked, function(directions){
                    for (var i=0;i<currentLinked.length;i++){
                        if (globals.linked.locked[j][0]) directions[i].x = 0;
                        if (globals.linked.locked[j][1]) directions[i].y = 0;
                        currentLinked[i].moveManually(currentLinked[i].getPosition().add(directions[i]));
                    }
                    globals.solver.resetK_matrix();
                    globals.solver.solve();
                    if (lastFL-globals.sumFL <= globals.gradTolerance){
                        numConverged++;
                    }
                    lastFL = globals.sumFL;
                });
            }

            globals.controls.viewModeCallback();
            if (numConverged == globals.linked.linked.length){
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
        if (originalPositions.length == 0){
            console.warn("no positions left");
            return;
        }
        var lastPositions = originalPositions[originalPositions.length-1];
        for (var i=0;i<lastPositions.length;i++) {
            globals.nodes[i].moveManually(lastPositions[i]);
        }
        originalPositions.pop();
        globals.solver.resetK_matrix();
        globals.solver.solve();
        globals.controls.viewModeCallback();
        if (originalPositions.length == 0) $("#resetOptimization").hide();
    }

    return {
        sync: sync,
        syncFixed: syncFixed,
        calcGrad: calcGrad,
        resetF_matrix: resetF_matrix,
        hide: hide,
        startOptimization: startOptimization,
        pauseOptimization: pauseOptimization,
        resetOptimization: resetOptimization
    }
}