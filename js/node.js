/**
 * Created by ghassaei on 9/16/16.
 */

var nodeMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
var nodeMaterialFixed = new THREE.MeshBasicMaterial({color: 0x000000});
var nodeMaterialDelete = new THREE.MeshBasicMaterial({color: 0xff0000});
var nodeMaterialHighlight = new THREE.MeshBasicMaterial({color: 0xffffff});
var nodeGeo = new THREE.CircleGeometry(5);
//nodeGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
var nodeFixedGeo = new THREE.CubeGeometry(12, 12, 12);

var optGeo = new THREE.Geometry();
optGeo.vertices.push(new THREE.Vector3(8.5, -4, 0));
optGeo.vertices.push(new THREE.Vector3(8.5, 4, 0));
optGeo.vertices.push(new THREE.Vector3(14.5, 0, 0));
optGeo.vertices.push(new THREE.Vector3(-8.5, -4, 0));
optGeo.vertices.push(new THREE.Vector3(-8.5, 4, 0));
optGeo.vertices.push(new THREE.Vector3(-14.5, 0, 0));
optGeo.faces.push(new THREE.Face3(0,2,1));
optGeo.faces.push(new THREE.Face3(3,4,5));
var optMaterial = new THREE.MeshBasicMaterial({color:0x444444, transparent:true, opacity:0.5});
var optMaterialHighlight = new THREE.MeshBasicMaterial({color:0xff00ff, transparent:true, opacity:0.95});

function Node(position, globals, noAdd){

    this.type = "node";

    this.beams = [];
    this.externalForce = null;
    this.fixed = false;

    if (noAdd === undefined){

        var optimizationArrows = new THREE.Object3D();
        optimizationArrows.add(new THREE.Mesh(optGeo, optMaterial));
        optimizationArrows.add(new THREE.Mesh(optGeo, optMaterial));
        optimizationArrows.children[1].rotation.z = Math.PI/2;
        globals.threeView.secondPassSceneAdd(optimizationArrows);
        this.optimizationArrows = optimizationArrows;
        this.optimizationArrows.visible = false;

        this.object3D = new THREE.Mesh(nodeGeo, nodeMaterial);
        this.object3D._myNode = this;
        globals.threeView.thirdPassSceneAdd(this.object3D);

        this.move(position);
    } else {
        this.position = position.clone();
    }
}


Node.prototype.setFixed = function(fixed){
    this.fixed = fixed;
    if (fixed) {
        this.object3D.material = nodeMaterialFixed;
        this.object3D.geometry = nodeFixedGeo;
    }
    else {
        this.object3D.material = nodeMaterial;
        this.object3D.geometry = nodeGeo;
    }
    if (this.externalForce){
        if (fixed) this.externalForce.hide();
        else this.externalForce.show();
    }
};




//forces

Node.prototype.addExternalForce = function(force){
    this.externalForce = force;
    force.setNode(this);
    force.setOrigin(this.getPosition());
    if (this.fixed) force.hide();
};

Node.prototype.removeExternalForce = function(){
    this.externalForce = null;
};

Node.prototype.getExternalForce = function(){
    if (this.externalForce) return this.externalForce.getForce();
    return new THREE.Vector3(0,0,0);
};



//beams

Node.prototype.addBeam = function(beam){
    this.beams.push(beam);
};

Node.prototype.removeBeam = function(beam){
    if (this.beams === null) return;
    var index = this.beams.indexOf(beam);
    if (index>=0) this.beams.splice(index, 1);
    // if (this.beams.length == 0) globals.removeNode(this);
};

Node.prototype.getBeams = function(){
    return this.beams;
};





Node.prototype.getObject3D = function(){
    return this.object3D;
};

Node.prototype.setDeleteMode = function(){
    this.object3D.material = nodeMaterialDelete;
};

Node.prototype.highlight = function(){
    if (globals.deleteMode || (globals.addRemoveFixedMode && this.fixed)) {
        this.setDeleteMode();
    }
    else this.object3D.material = nodeMaterialHighlight;
};

Node.prototype.unhighlight = function(){
    if (this.fixed) {
        this.object3D.material = nodeMaterialFixed;
    }
    else {
        this.object3D.material = nodeMaterial;
    }
};

Node.prototype.hide = function(){
    this.object3D.visible = false;
};
Node.prototype.show = function(){
    this.object3D.visible = true;
};

Node.prototype.moveManually = function(position){
    this.optimizationArrows.position.set(position.x, position.y, position.z);
    this.object3D.position.set(position.x, position.y, position.z);
    _.each(this.beams, function(beam){
        beam.render();
    });
    if (this.externalForce) this.externalForce.setOrigin(position.clone());
};

Node.prototype.move = function(position){
    this.optimizationArrows.position.set(position.x, position.y, position.z);
    this.object3D.position.set(position.x, position.y, position.z);
    _.each(this.beams, function(beam){
        beam.render();
    });
    if (this.externalForce) this.externalForce.setOrigin(position.clone());
};

Node.prototype.getPosition = function(){
    if (this.position) return this.position.clone();
    return this.object3D.position.clone();
};

Node.prototype.setSelected = function(state, highlighted){
    if (!this.optimizationArrows) return;
    if (highlighted){
        this.optimizationArrows.visible = true;
        this.optimizationArrows.children[0].material = optMaterialHighlight;
        this.optimizationArrows.children[0].visible = true;
        this.optimizationArrows.children[1].material = optMaterialHighlight;
        this.optimizationArrows.children[1].visible = true;
        return;
    }
    this.optimizationArrows.children[0].material = optMaterial;
    this.optimizationArrows.children[1].material = optMaterial;
    this.optimizationArrows.visible = state;
    if (state == false){
        var linked = globals.linked.linked;
        for (var i=0;i<linked.length;i++){
            for (var j=0;j<linked[i].length;j++){
                if (linked[i][j] == this){
                    this.setOptVis(0, !globals.linked.locked[i][0]);
                    this.setOptVis(1, !globals.linked.locked[i][1]);
                    return;
                }
            }
        }
    }
};

Node.prototype.setOptVis = function(axis, state){
    this.optimizationArrows.children[axis].visible = state;
};






Node.prototype.clone = function(){
    var node = new Node(this.getPosition(), globals, true);
    node.fixed = this.fixed;
    if (this.externalForce) node.externalForce = this.externalForce;
    return node;
};


//deallocate

Node.prototype.destroy = function(){
    if (this.deleting) return;
    this.deleting = true;
    globals.linked.removeNode(this);
    if (this.optimizationArrows) globals.threeView.secondPassSceneRemove(this.optimizationArrows);
    this.optimizationArrows = null;

    globals.threeView.thirdPassSceneRemove(this.object3D);
    this.object3D._myNode = null;
    this.object3D = null;
    for (var i=this.beams.length-1;i>=0;i--){
        var beam = this.beams[i];
        globals.removeEdge(beam);
    }
    this.beams = null;
    if (this.externalForce) this.externalForce.destroy();
    this.externalForce = null;
};