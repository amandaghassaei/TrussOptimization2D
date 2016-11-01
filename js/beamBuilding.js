/**
 * Created by ghassaei on 11/1/16.
 */


var beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);

function BeamBuilding(startNode, end, globals){

    this.type = "beamBuilding";

    this.node = startNode;
    this.start = startNode.getPosition();
    this.end = end.clone();
    this.object3D = new THREE.Mesh(beamGeometry, beamMaterialHighlight);
    globals.threeView.sceneAdd(this.object3D);
    this.render();
}

BeamBuilding.prototype.setEnd = function(end){
    this.end = end.clone();
    this.render();
};

BeamBuilding.prototype.getStart = function(){
    return this.start.clone();
};

BeamBuilding.prototype.getLength = function(){
    return this.getVector().length();
};

BeamBuilding.prototype.getVector = function(){
    return this.start.clone().sub(this.end);
};



//render


BeamBuilding.prototype.render = function(){
    var length = this.getLength();
    if (length == 0) {
        this.object3D.scale.y = 0.00001;
        this.object3D.position.set(this.start.x, this.start.y, this.start.z);
        return;
    }
    this.object3D.scale.y = length;
    var beamAxis = this.getVector();
    var axis = (new THREE.Vector3(0,1,0)).cross(beamAxis).normalize();
    var angle = Math.acos(new THREE.Vector3(0,1,0).dot(beamAxis.normalize()));
    var quaternion = (new THREE.Quaternion()).setFromAxisAngle(axis, angle);
    var position = (this.start.clone().add(this.end)).multiplyScalar(0.5);
    this.object3D.position.set(position.x, position.y, position.z);
    this.object3D.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
};




BeamBuilding.prototype.shouldBuildBeam = function(otherNode){
    if (otherNode == this.node) return false;
    for (var i=0;i<this.node.beams.length;i++){
        var beam = this.node.beams[i];
        if (beam.getOtherNode(this.node) == otherNode) return false;
    }
    return true;
};



//deallocate

BeamBuilding.prototype.destroy = function(){
    globals.threeView.sceneRemove(this.object3D);
    this.object3D = null;
    this.node = null;
};