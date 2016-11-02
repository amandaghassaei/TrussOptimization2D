/**
 * Created by ghassaei on 10/2/16.
 */


function Force(force, globals){
    this.type = "force";
    this.force = force.clone();
    this.object3D = new THREE.ArrowHelper(this.getDirection(), new THREE.Vector3(), this.getLength(), 0xb67df0);
    this.object3D.line.material.linewidth = 4;
    this.update();
    this.object3D.cone._myForce = this;
    globals.threeView.sceneAdd(this.object3D);
}

Force.prototype.setNode = function(node){
    this.node = node;
};

Force.prototype.getObject3D = function(){
    return this.object3D;
};

Force.prototype.setForce = function(force){
    this.force = force;
    this.update();
};

Force.prototype.setMagnitude = function(mag){
    this.setForce(this.getForce().normalize().multiplyScalar(mag));
};

Force.prototype.setOrigin = function(origin){
    this.object3D.position.set(origin.x, origin.y, origin.z);
};

Force.prototype.getLength = function(){
    return this.getForce().length();
};

Force.prototype.move = function(position){
    var force = position.sub(this.object3D.position);
    this.setForce(force);
};

Force.prototype.getDirection = function(){
    return this.getForce().normalize();
};

Force.prototype.getForce = function(){
    return this.force.clone();
};

Force.prototype.highlight = function(){
    if (globals.deleteMode){
        this.object3D.line.material.color.setHex(0xff0000);
        this.object3D.cone.material.color.setHex(0xff0000);
    } else {
        this.object3D.line.material.color.setHex(0xd0abf5);
        this.object3D.cone.material.color.setHex(0xd0abf5);
    }
};

Force.prototype.unhighlight = function(){
    this.object3D.line.material.color.setHex(0xb67df0);
    this.object3D.cone.material.color.setHex(0xb67df0);
};

Force.prototype.getPosition = function(){
    return this.object3D.position.clone().add(this.object3D.cone.position);
};

Force.prototype.hide = function(){
    this.object3D.visible = false;
};

Force.prototype.show = function(){
    this.object3D.visible = true;
};

Force.prototype.update = function(){
    this.object3D.setDirection(this.getDirection());
    var length = this.getLength();
    if (length<1.1) length = 1.1;//prevent arrow from having zero length
    this.object3D.setLength(length, 1, 1);
};

Force.prototype.destroy = function(){
    globals.threeView.sceneRemove(this.object3D);
    this.object3D.cone._myForce = null;
    this.object3D = null;
    this.node.removeExternalForce(this);
    this.node = null;
};