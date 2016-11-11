/**
 * Created by ghassaei on 9/16/16.
 */

var beamMaterialHighlight = new THREE.MeshBasicMaterial({color: 0xffffff});
var beamMaterialDelete = new THREE.MeshBasicMaterial({color:0xff0000});
var beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);

function Beam(nodes, globals, noAdd){

    this.type = "beam";
    nodes[0].addBeam(this);
    nodes[1].addBeam(this);
    this.nodes = nodes;

    if (noAdd === undefined){
        this.material = new THREE.MeshBasicMaterial();
        this.object3D = new THREE.Mesh(beamGeometry, this.material);
        this.setDefaultColor();
        this.object3D._myBeam = this;
        globals.threeView.sceneAdd(this.object3D);
        this.render();
    }
}

Beam.prototype.highlight = function(){
    if (globals.deleteMode) this.object3D.material = beamMaterialDelete;
    else this.object3D.material = beamMaterialHighlight;
};

Beam.prototype.unhighlight = function(){
    if (this.material) this.object3D.material = this.material;
};

Beam.prototype.setDefaultColor = function(){
    this.object3D.material.color.setHex(0x444444);
};

Beam.prototype.setColor = function(hex){
    this.object3D.material.color.setHex(hex);
};

Beam.prototype.setHSLColor = function(val, max, min){
    if (val === null){
        this.object3D.material.color.setHex(0x000000);
        return;
    }
    var scaledVal = (1-(val - min)/(max - min)) * 0.7;
    var color = new THREE.Color();
    color.setHSL(scaledVal, 1, 0.5);
    this.object3D.material.color.set(color);
};

Beam.prototype.redBlueColor = function(val, max){
    var scaledVal = Math.pow(val/max, 1/2);
    if (this.isInCompression()){
        this.object3D.material.color.setRGB(scaledVal, 0, 0);
    } else {
        this.object3D.material.color.setRGB(0, 0, scaledVal);
    }
};

Beam.prototype.isInCompression = function(){
    return this.force>0;
};

Beam.prototype.getLength = function(){
    var vertex1Pos = this.nodes[0].getPosition();
    var vertex2Pos = this.nodes[1].getPosition();
    return vertex1Pos.sub(vertex2Pos).length();
};

Beam.prototype.getVector = function(fromNode){
    var toNode = this.nodes[0];
    if (toNode == fromNode) toNode = this.nodes[1];
    return toNode.getPosition().sub(fromNode.getPosition());
};

Beam.prototype.isFixed = function(){
    return this.nodes[0].fixed && this.nodes[1].fixed;
};


Beam.prototype.getOtherNode = function(node){
    if (this.nodes[0] == node) return this.nodes[1];
    return this.nodes[0];
};

Beam.prototype.setDeleteMode = function(){
    this.object3D.material = beamMaterialDelete;
};

Beam.prototype.setInternalForce = function(force){
    this.force = force;
};

Beam.prototype.getForce = function(){
    if (this.isFixed()) return null;
    return this.force;
};

Beam.prototype.setDeformation = function(deformation){
    this.deformation = deformation;
};

Beam.prototype.getDeformation = function(){
    if (this.isFixed()) return null;
    return this.deformation;
};

Beam.prototype.getAngle = function(fromNode) {
	var toNode = this.nodes[0];
    if (toNode == fromNode) toNode = this.nodes[1];
    var toPos = toNode.getPosition();
    var fromPos = fromNode.getPosition();
	return Math.atan2(fromPos.y-toPos.y, fromPos.x-toPos.x);
};



//render

Beam.prototype.getObject3D = function(){
    return this.object3D;
};

Beam.prototype.getNodes = function(){
    return this.nodes;
};

Beam.prototype.render = function(){
    this.object3D.scale.y = this.getLength();
    var beamAxis = this.nodes[0].getPosition().sub(this.nodes[1].getPosition());
    var axis = (new THREE.Vector3(0,1,0)).cross(beamAxis).normalize();
    var angle = Math.acos(new THREE.Vector3(0,1,0).dot(beamAxis.normalize()));
    var quaternion = (new THREE.Quaternion()).setFromAxisAngle(axis, angle);
    var position = (this.nodes[0].getPosition().add(this.nodes[1].getPosition())).multiplyScalar(0.5);
    this.object3D.position.set(position.x, position.y, position.z);
    this.object3D.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
};



//deallocate

Beam.prototype.destroy = function(){
    var self = this;
    _.each(this.nodes, function(node){
        node.removeBeam(self);
    });
    globals.threeView.sceneRemove(this.object3D);
    this.object3D._myBeam = null;
    this.object3D = null;
    this.material = null;
    this.nodes = null;
};