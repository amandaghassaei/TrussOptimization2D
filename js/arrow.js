/**
 * Created by ghassaei on 11/12/16.
 */

var coneGeo = new THREE.CylinderGeometry(0, 3, 6);
coneGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,1.5,0));
var axisGeo = new THREE.CylinderGeometry(1, 1, 1);
axisGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));

function Arrow(origin, direction, length, radius, color){
    this.material = new THREE.MeshBasicMaterial({color: color});
    this.cone = new THREE.Mesh(coneGeo, this.material);
    //this.cone.position.y = 3;
    this.axis = new THREE.Mesh(axisGeo, this.material);
    this.object3D = new THREE.Object3D();
    this.object3D.add(this.cone);
    this.object3D.add(this.axis);
    this.origin = origin;
    this.setDirection(direction);
    this.setOrigin(origin);
    this.setLength(length);
    this.setRadius(radius);
}

Arrow.prototype.setDirection = function(direction){
    if (direction.length() == 0) direction = new THREE.Vector3(0,1,0);
    this.direction = direction;
    this.setOrigin(this.origin);
    var axis = (new THREE.Vector3(0,1,0)).cross(direction).normalize();
    if (axis.length() == 0) axis = new THREE.Vector3(1,0,0);
    var angle = Math.acos(new THREE.Vector3(0,1,0).dot(direction.normalize()));
    var quaternion = (new THREE.Quaternion()).setFromAxisAngle(axis, angle);
    this.object3D.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
};

Arrow.prototype.setLength = function(length){
    if (length == 0) length = 0.001;
    this.axis.scale.y = length;
    this.cone.position.set(0, length, 0);
};

Arrow.prototype.setOrigin = function(origin){
    this.origin = origin;
    var offset = this.direction.clone().multiplyScalar(10).add(origin);
    this.object3D.position.set(offset.x, offset.y, offset.z);
};

Arrow.prototype.setRadius = function(radius){
    this.axis.scale.x = radius;
    this.axis.scale.z = radius;
    this.cone.scale.set(radius, radius, radius);
};

Arrow.prototype.getObject3D = function(){
    return this.object3D;
};

Arrow.prototype.destroy = function(){
    this.cone = null;
    this.axis = null;
    this.material = null;
    this.direction = null;
    this.origin = null;
    this.object3D.children = [];
    this.object3D = null;
};