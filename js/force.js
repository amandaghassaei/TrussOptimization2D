/**
 * Created by ghassaei on 10/2/16.
 */


function Force(force, globals){
    this.type = "force";
    this.force = force.clone();
    this.arrow = new Arrow(new THREE.Vector3(), this.getDirection(), this.getLength(), 2, 0xcccccc);
    this.object3D = this.arrow.getObject3D();
    this.update();
    this.object3D.children[0]._myForce = this;
    globals.threeView.thirdPassSceneAdd(this.object3D);
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
    this.arrow.setOrigin(origin);
};

Force.prototype.getLength = function(){
    return this.getForce().length();
};

Force.prototype.move = function(position){
    var force = position.sub(this.node.object3D.position);
    var length = force.length() - 13;
    var direction = force.normalize();
    if (length<=0) {
        this.setForce(new THREE.Vector3());
        return;
    }
    var offset = direction.multiplyScalar(length);
    this.setForce(offset);
};

Force.prototype.getDirection = function(){
    return this.getForce().normalize();
};

Force.prototype.getForce = function(){
    return this.force.clone();
};

Force.prototype.highlight = function(){
    if (globals.deleteMode){
        this.arrow.material.color.setHex(0xff0000);
    } else {
        this.arrow.material.color.setHex(0x000000);
    }
};

Force.prototype.unhighlight = function(){
    this.arrow.material.color.setHex(0xcccccc);
};

Force.prototype.getPosition = function(){
    return this.object3D.position.clone().add(this.arrow.cone.position);
};

Force.prototype.hide = function(){
    this.object3D.visible = false;
};

Force.prototype.show = function(){
    this.object3D.visible = true;
};

Force.prototype.update = function(){
    this.arrow.setDirection(this.getDirection());
    var length = this.getLength();
    if (length<1.1) length = 1.1;//prevent arrow from having zero length
    this.arrow.setLength(length, 1, 1);
};

Force.prototype.destroy = function(){
    globals.threeView.sceneRemove(this.object3D);
    this.object3D.children[0]._myForce = null;
    this.object3D = null;
    this.arrow.destroy();
    this.arrow = null;
    this.node.removeExternalForce(this);
    this.node = null;
};