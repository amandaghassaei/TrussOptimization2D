/**
 * Created by ghassaei on 9/16/16.
 */

var nodeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side:THREE.DoubleSide});
var nodeMaterialFixed = new THREE.MeshBasicMaterial({color: 0x000000, side:THREE.DoubleSide});
var nodeMaterialDelete = new THREE.MeshBasicMaterial({color: 0xff0000, side:THREE.DoubleSide});
var nodeMaterialHighlight = new THREE.MeshBasicMaterial({color: 0xff00ff, side:THREE.DoubleSide});
var nodeGeo = new THREE.CircleGeometry(0.2,20);
nodeGeo.rotateX(Math.PI/2);
var nodeFixedGeo = new THREE.CubeGeometry(1, 0.5, 1);
nodeFixedGeo.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0.25, 0) );


function Node(position, index){

    this.index = index;

    this.object3D = new THREE.Mesh(nodeGeo, nodeMaterial);
    this.object3D._myNode = this;

    this.beams = [];
    this.externalForces = [];
    this.fixed = false;

    this.render(position);
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
    _.each(this.externalForces, function(force){
        if (fixed) force.hide();
        else force.show();
    });
};




//forces

Node.prototype.addExternalForce = function(force){
    this.externalForces.push(force);
    force.setOrigin(this.getPosition());
    if (this.fixed) foroce.hide();
};

Node.prototype.removeForce = function(force){
    if (this.externalForces === null) return;
    var index = this.externalForces.indexOf(force);
    if (index>=0) this.externalForces.splice(index, 1);
};



//beams

Node.prototype.addBeam = function(beam){
    this.beams.push(beam);
};

Node.prototype.removeBeam = function(beam){
    if (this.beams === null) return;
    var index = this.beams.indexOf(beam);
    if (index>=0) this.beams.splice(index, 1);
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
    this.object3D.material = nodeMaterialHighlight;
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

Node.prototype.move = function(position){
    this.object3D.position.set(position.x, position.y, position.z);
    _.each(this.beams, function(beam){
        beam.render();
    });
};

Node.prototype.getPosition = function(){
    return this.object3D.position.clone();
};







Node.prototype.clone = function(){
    var node = new Node(this.getPosition(), this.getIndex());
    node.setFixed(this.fixed);
    _.each(this.externalForces, function(force){
        node.addExternalForce(force);
    });
    return node;
};


//deallocate

Node.prototype.destroy = function(){
    globals.threeView.sceneRemove(this.object3D);
    this.object3D._myNode = null;
    this.object3D = null;
    this.beams = null;
    _.each(this.externalForces, function(force){
        force.destroy();
    });
    this.externalForces = null;
};