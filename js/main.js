/**
 * Created by ghassaei on 10/27/16.
 */

globals = {};

$(function() {

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
    globals.threeView.render();


    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var highlightedObj;
    var isDragging = false;
    var mouseDown = false;

    document.addEventListener('mousedown', function(){
        mouseDown = true;
    }, false);

    document.addEventListener('mouseup', function(e){
        isDragging = false;
        mouseDown = false;
    }, false);

    document.addEventListener( 'mousemove', mouseMove, false );
    function mouseMove(e){

        if (mouseDown) {
            isDragging = true;
        }

        e.preventDefault();
        globals.controls.hideMoreInfo();
        mouse.x = (e.clientX/window.innerWidth)*2-1;
        mouse.y = - (e.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse, globals.threeView.camera);

        var _highlightedObj = null;
        if (!isDragging) {
            var objsToIntersect = globals.threeView.getObjToIntersect();
            _highlightedObj = checkForIntersections(e, objsToIntersect);
        }
        if (highlightedObj && (_highlightedObj != highlightedObj)) highlightedObj.unhighlight();
        highlightedObj = _highlightedObj;

        if (globals.viewMode == "length"){
            if (highlightedObj && (highlightedObj.type == "dynamicBeam" || highlightedObj.type == "staticBeam")){
                globals.controls.showMoreInfo("Length: " +
                        highlightedObj.getLength().toFixed(2) + " m", e);
            }
        } else if (globals.viewMode == "force"){
            if (highlightedObj && (highlightedObj.type == "dynamicBeam" || highlightedObj.type == "staticBeam")){
                globals.controls.showMoreInfo("Internal Force: " +
                        highlightedObj.getForce().toFixed(2) + " N", e);
            }
        }
    }

    function checkForIntersections(e, objects){
        var _highlightedObj = null;
        var intersections = raycaster.intersectObjects(objects, true);
        if (intersections.length > 0) {
            var objectFound = false;
            _.each(intersections, function (thing) {
                if (objectFound) return;
                if (thing.object && thing.object._myNode){
                    _highlightedObj = thing.object._myNode;
                    _highlightedObj.highlight();
                    objectFound = true;
                } else if (thing.object && thing.object._myBeam) {
                    _highlightedObj = thing.object._myBeam;
                    _highlightedObj.highlight();
                    objectFound = true;
                } else if (thing.object && thing.object._myForce) {
                    _highlightedObj = thing.object._myForce;
                    _highlightedObj.highlight();
                    objectFound = true;
                }
            });
        }
        return _highlightedObj;
    }

});