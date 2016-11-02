/**
 * Created by ghassaei on 9/16/16.
 */

var nodeMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
var nodeMaterialFixed = new THREE.MeshBasicMaterial({color: 0x000000});
var nodeMaterialDelete = new THREE.MeshBasicMaterial({color: 0xff0000});
var nodeMaterialHighlight = new THREE.MeshBasicMaterial({color: 0xffffff});
var nodeGeo = new THREE.SphereGeometry(0.2);
nodeGeo.rotateX(Math.PI/2);
var nodeFixedGeo = new THREE.CubeGeometry(0.5, 0.5, 0.5);


function Node(position, globals){

    this.type = "node";

    this.object3D = new THREE.Mesh(nodeGeo, nodeMaterial);
    this.object3D._myNode = this;
    globals.threeView.sceneAdd(this.object3D);

    this.beams = [];
    this.externalForce = null;
    this.fixed = false;

    this.move(position);
}

Node.prototype.setIndex = function(index){
    this.index = index;
};

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



//beams

Node.prototype.addBeam = function(beam){
    this.beams.push(beam);
};

Node.prototype.removeBeam = function(beam){
    if (this.beams === null) return;
    var index = this.beams.indexOf(beam);
    if (index>=0) this.beams.splice(index, 1);
    if (this.beams.length == 0) globals.removeNode(this);
};

Node.prototype.getBeams = function(){
    return this.beams;
};




Node.prototype.getIndex = function(){//in nodes array
    return this.index;
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

Node.prototype.move = function(position){
    this.object3D.position.set(position.x, position.y, position.z);
    _.each(this.beams, function(beam){
        beam.render();
    });
    if (this.externalForce) this.externalForce.setOrigin(position.clone());
};

Node.prototype.getPosition = function(){
    return this.object3D.position.clone();
};







Node.prototype.clone = function(){
    var node = new Node(this.getPosition(), this.getIndex());
    node.setFixed(this.fixed);
    if (this.externalForce) node.addExternalForce(this.externalForce);
    return node;
};


//deallocate

Node.prototype.destroy = function(){
    if (this.deleting) return;
    this.deleting = true;
    globals.threeView.sceneRemove(this.object3D);
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