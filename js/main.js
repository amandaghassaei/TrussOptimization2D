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

    var force = new Force(new THREE.Vector3(2,1.4,0.2), globals);
    nodes[3].addExternalForce(force);

    globals.threeView.render();


    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var raycasterPlane = new THREE.Plane(new THREE.Vector3(0,0,1));
    var highlightedObj;
    var isDragging = false;
    var isDraggingNode = false;
    var isDraggingForce = false;
    var mouseDown = false;
    var beamInProgress = null;

    $(document).dblclick(function() {
        if (highlightedObj && highlightedObj.type == "node"){
            beamInProgress = new BeamBuilding(highlightedObj, highlightedObj.getPosition(), globals);
            highlightedObj.unhighlight();
            highlightedObj = null;
        }
    });

    document.addEventListener('mousedown', function(){
        mouseDown = true;

        if (beamInProgress && highlightedObj && highlightedObj.type == "node"){
            if (beamInProgress.shouldBuildBeam(highlightedObj)){
                console.log("new beam");
                edges.push(new Beam([nodes[beamInProgress.node.getIndex()], nodes[highlightedObj.getIndex()]], globals));
            }
            beamInProgress.destroy();
            beamInProgress = null;
            globals.threeView.render();

        }

    }, false);

    document.addEventListener('mouseup', function(e){
        if (isDraggingNode){
            isDraggingNode = false;
            globals.threeView.enableControls(true);
        }
        if (isDraggingForce){
            isDraggingForce = false;
            globals.threeView.enableControls(true);
        }
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

        if (beamInProgress){
            var intersection = getIntersectionWithObjectPlane(beamInProgress.getStart());
            beamInProgress.setEnd(intersection);
            globals.threeView.render();
        }

        if (!isDragging) {
            var objsToIntersect = globals.threeView.getObjToIntersect();
            _highlightedObj = checkForIntersections(e, objsToIntersect);
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

        } else if (isDragging && highlightedObj){

            if (highlightedObj.type == "node"){
                if (!isDraggingNode) {
                    isDraggingNode = true;
                    globals.threeView.enableControls(false);
                }
                var intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition());
                raycaster.ray.intersectPlane(raycasterPlane, intersection);
                highlightedObj.move(intersection);
                globals.threeView.render();
            } else if (highlightedObj.type == "beam"){
            } else if (highlightedObj.type == "force"){
                if (!isDraggingForce) {
                    isDraggingForce = true;
                    globals.threeView.enableControls(false);
                }
                var intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition());
                highlightedObj.move(intersection);
                globals.threeView.render();
            }
        }
    }

    function getIntersectionWithObjectPlane(position){
        var cameraOrientation = globals.threeView.camera.getWorldDirection();
        var dist = position.dot(cameraOrientation);
        raycasterPlane.set(cameraOrientation, -dist);
        var intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(raycasterPlane, intersection);
        return intersection;
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