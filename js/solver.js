/**
 * Created by ghassaei on 11/11/16.
 */


function Solver(){
    this.K_matrix = null;
    this.K_A_transpose = null;
    this.F_matrix = null;
    this.u = null;
    this.internalForces = null;
}

Solver.prototype.solve = function(nodes, edges, xyOnly, callback){

    var freeNodes = [];
    var freeEdges = [];
    if (this.K_matrix === null || this.F_matrix === null){
        for (var i=0;i<nodes.length;i++){
            if (nodes[i].fixed) continue;
            freeNodes.push(i);
        }

        for (var i=0;i<edges.length;i++){
            if (edges[i].isFixed()) continue;
            freeEdges.push(i);
        }
    }

    if (this.K_matrix === null){
        //A*k*At
        var A = [];
        for (var i=0;i<freeNodes.length;i++){
            var node = nodes[freeNodes[i]];
            A.push(this.initEmptyArray(freeEdges.length));
            A.push(this.initEmptyArray(freeEdges.length));
            if (!xyOnly) A.push(this.initEmptyArray(freeEdges.length));
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
                if (xyOnly){
                    A[i*2][index] = vector.x/length;
                    A[i*2+1][index] = vector.y/length;
                } else {
                    A[i*3][index] = vector.x/length;
                    A[i*3+1][index] = vector.y/length;
                    A[i*3+2][index] = vector.z/length;
                }
            }
        }
        var A_transpose = numeric.transpose(A);
        var k = this.initEmptyArray(freeEdges.length, freeEdges.length);
        for (var i=0;i<freeEdges.length;i++){
            var edge = edges[freeEdges[i]];
            k[i][i] = 200000000000/edge.getLength();
        }
        this.K_A_transpose = numeric.dot(k, A_transpose);
        var mat = numeric.dot(A, this.K_A_transpose);
        var determinant = numeric.det(mat);
        if (determinant == 0) {
            console.warn("unsolvable");
            resetK_matrix();
            if (callback) callback(this.initEmptyArray(freeEdges.length), freeEdges);
            return;
        }
        this.K_matrix = numeric.inv(mat);
    }

    if (this.F_matrix === null){
        this.F_matrix = [];
        for (var i=0;i<freeNodes.length;i++){
            var node = nodes[freeNodes[i]];
            var force = node.getExternalForce();
            this.F_matrix.push(force.x);
            this.F_matrix.push(force.y);
            if (!xyOnly) this.F_matrix.push(force.z);
        }
    }

    this.u = numeric.dot(this.F_matrix, this.K_matrix);
    this.internalForces = numeric.dot(this.K_A_transpose, this.u);

    if (callback) callback(this.internalForces, freeEdges);
};

Solver.prototype.initEmptyArray = function(dim1, dim2, dim3){
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
};

Solver.prototype.resetF_matrix = function(){
    this.F_matrix = null;
};
Solver.prototype.resetK_matrix = function(){
    this.K_matrix = null;
};