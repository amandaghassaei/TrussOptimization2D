/**
 * Created by ghassaei on 11/1/16.
 */


function initSolver(globals){

    var K_matrix = null;
    var K_A_transpose = null;
    var F_matrix = null;

    var u = null;
    var internalForces = null;

    function initEmptyArray(dim1, dim2, dim3){
        if (dim2 === undefined) dim2 = 0;
        if (dim3 === undefined) dim3 = 0;
        var array = [];
        for (var i=0;i<dim1;i++){
            if (dim2 == 0) array.push(0);
            else array.push([]);
            for (var j=0;j<dim2;j++){
                if (dim3 == 0) array[i].push(0);
                else array[i].push([]);
                for (var k=0;k<dim3;k++){
                    array[i][j].push(0);
                }
            }
        }
        return array;
    }

    function solve(){
        var nodes = globals.nodes;
        var edges = globals.edges;

        var freeNodes = [];
        for (var i=0;i<nodes.length;i++){
            if (nodes[i].fixed) continue;
            freeNodes.push(i);
        }
        var freeEdges = [];
        for (var i=0;i<edges.length;i++){
            if (edges[i].isFixed()) continue;
            freeEdges.push(i);
        }

        if (K_matrix === null){
            //A*k*At
            var A = [];
            for (var i=0;i<freeNodes.length;i++){
                var node = nodes[freeNodes[i]];
                A.push(initEmptyArray(freeEdges.length));
                A.push(initEmptyArray(freeEdges.length));
                A.push(initEmptyArray(freeEdges.length));
                for (var j=0;j<node.beams.length;j++){
                    var edge = node.beams[j];
                    if (edge.isFixed()) continue;
                    var vector = edge.getVector(node);
                    var length = vector.length();
                    var index = edges.indexOf(edge);
                    if (index < 0) {
                        console.log("problem here");
                        return;
                    }
                    var index = freeEdges.indexOf(index);
                    if (index < 0) {
                        console.log("problem here");
                        return;
                    }
                    A[i*3][index] = vector.x/length;
                    A[i*3+1][index] = vector.y/length;
                    A[i*3+2][index] = vector.z/length;
                }
            }
            var A_transpose = numeric.transpose(A);
            var k = initEmptyArray(freeEdges.length, freeEdges.length);
            for (var i=0;i<freeEdges.length;i++){
                var edge = edges[freeEdges[i]];
                k[i][i] = 200000000000/edge.getLength();
            }
            K_A_transpose = numeric.dot(k, A_transpose);
            var mat = numeric.dot(A, K_A_transpose);
            var determinant = numeric.det(mat);
            if (determinant == 0) {
                console.warn("unsolvable");
                return;
            }
            K_matrix = numeric.inv(mat);
        }

        if (F_matrix === null){
            F_matrix = [];
            for (var i=0;i<freeNodes.length;i++){
                var node = nodes[freeNodes[i]];
                var force = node.getExternalForce();
                F_matrix.push(force.x);
                F_matrix.push(force.y);
                F_matrix.push(force.z);
            }
        }

        u = numeric.dot(F_matrix, K_matrix);
        internalForces = numeric.dot(K_A_transpose, u);
        console.log(internalForces);
    }

    function resetF_matrix(){
        F_matrix = null;
    }
    function resetK_matrix(){
        K_matrix = null;
    }


    return {
        solve: solve,
        resetF_matrix: resetF_matrix,
        resetK_matrix: resetK_matrix
    }
}