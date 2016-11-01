/**
 * Created by ghassaei on 9/16/16.
 */

var beamMaterialHighlight = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4});

function Beam(nodes, globals){

    nodes[0].addBeam(this);
    nodes[1].addBeam(this);
    this.vertices = [nodes[0].getPosition(), nodes[1].getPosition()];
    this.nodes = nodes;

    var lineGeometry = new THREE.Geometry();
    lineGeometry.dynamic = true;
    lineGeometry.vertices = this.vertices;

    this.material = new THREE.LineBasicMaterial({linewidth: 3});
    this.object3D = new THREE.Line(lineGeometry, this.material);
    this.object3D._myBeam = this;
    globals.threeView.sceneAdd(this.object3D);
}

Beam.prototype.highlight = function(){
    this.object3D.material = beamMaterialHighlight;
};

Beam.prototype.unhighlight = function(){
    if (this.material) this.object3D.material = this.material;
};

Beam.prototype.setColor = function(hex){
    this.object3D.material.color.setHex(hex);
};

Beam.prototype.setHSLColor = function(val, max, min){
    if (val === null){
        this.object3D.material.color.setHex(0x000000);
        return;
    }
    var scaledVal = (val - min)/(max - min) * 0.7;
    var color = new THREE.Color();
    color.setHSL(scaledVal, 1, 0.5);
    this.object3D.material.color.set(color);
};

Beam.prototype.getLength = function(){
    var vertex1Pos = this.nodes[0].getPosition();
    var vertex2Pos = this.nodes[1].getPosition();
    return vertex1Pos.sub(vertex2Pos).length();
};

Beam.prototype.isFixed = function(){
    return this.nodes[0].fixed && this.nodes[1].fixed;
};

Beam.prototype.getForce = function(){
    if (this.isFixed()) return null;
    //todo
};

Beam.prototype.getVector = function(){
    return this.vertices[0].clone().sub(this.vertices[1]);
};




//render

Beam.prototype.getObject3D = function(){
    return this.object3D;
};

Beam.prototype.render = function(){
    this.object3D.geometry.verticesNeedUpdate = true;
    this.object3D.geometry.computeBoundingSphere();
};



//deallocate

Beam.prototype.destroy = function(){
    var self = this;
    _.each(this.nodes, function(node){
        node.removeBeam(self);
    });
    this.vertices = null;
    globals.threeView.sceneRemove(this.object3D);
    this.object3D._myBeam = null;
    this.object3D = null;
    this.material = null;
    this.nodes = null;
};