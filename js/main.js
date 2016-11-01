/**
 * Created by ghassaei on 10/27/16.
 */

globals = {};

$(function() {
    console.log("hi");

    globals = initGlobals();

    var nodePositions = [
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
        [1, 0, 1],
        [2, 0, 0],
        [2, 0, 1]
    ];

    var edgeConnections = [
        [0,1],
        [2, 3],
        [4, 5],
        [0, 2],
        [1, 3],
        [2, 4],
        [3, 5]
    ];

    var nodes = [];
    _.each(nodePositions, function(pos){
        var positon = new THREE.Vector3(pos[0], pos[1], pos[2]);
        nodes.push(new Node(positon, nodes.length, globals));
    });
    var edges = [];
    _.each(edgeConnections, function(connection){
        edges.push(new Beam([nodes[connection[0]], nodes[connection[1]]], globals));
    });
    console.log(globals.threeView.scene);
    globals.threeView.render();


});