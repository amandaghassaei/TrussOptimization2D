/**
 * Created by ghassaei on 11/1/16.
 */


function initSolver(globals){

    var solver = new Solver();

    function resetF_matrix(){
        solver.resetF_matrix();
    }
    function resetK_matrix(){
        solver.resetK_matrix();
    }

    function solve(){
        solver.solve(globals.nodes, globals.edges, globals.xyOnly, function (internalForces, freeEdges){
            var sumFL = 0;
            for (var i=0;i<freeEdges.length;i++){
                var edge = globals.edges[freeEdges[i]];
                edge.setInternalForce(internalForces[i]);
                sumFL += Math.abs(internalForces[i])*edge.getLength();
            }
            if (globals.viewMode == "force" || globals.viewMode == "tensionCompression"){
                globals.controls.viewModeCallback();
            }

            globals.sumFL = sumFL;

            $("#FL").html(sumFL.toFixed(2));
       });
    }


    return {
        solve: solve,
        resetF_matrix: resetF_matrix,
        resetK_matrix: resetK_matrix
    }
}