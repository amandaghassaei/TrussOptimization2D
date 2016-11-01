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

    _.each(nodePositions, function(pos){
        var position = new THREE.Vector3(pos[0], pos[1], pos[2]);
        var node = new Node(position, globals);
        globals.addNode(node);
    });
    _.each(edgeConnections, function(connection){
        var edge = new Beam([globals.nodes[connection[0]], globals.nodes[connection[1]]], globals);
        globals.addEdge(edge);
    });

    var force = new Force(new THREE.Vector3(2,1.4,0.2), globals);
    globals.nodes[3].addExternalForce(force);

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

    function setHighlightedObj(object){
        if (highlightedObj && (object != highlightedObj)) {
            highlightedObj.unhighlight();
            globals.controls.hideMoreInfo();
        }
        highlightedObj = object;
        if (highlightedObj) highlightedObj.highlight();
    }

    $(document).dblclick(function() {
        if (highlightedObj && highlightedObj.type == "node"){
            if (globals.lockTopology) return;
            beamInProgress = new BeamBuilding(highlightedObj, highlightedObj.getPosition(), globals);
            setHighlightedObj(null);
        } else if (highlightedObj && highlightedObj.type == "beam"){
            if (globals.lockTopology) return;
            var position = getPointOfIntersectionWithObject(highlightedObj.getObject3D());
            if (position === null) return;
            var oldEdge = highlightedObj;
            var node = new Node(position, globals);
            globals.addNode(node);
            var connectedNodes = oldEdge.getNodes();
            var beam1 = new Beam([connectedNodes[0], node], globals);
            globals.addEdge(beam1);
            var beam2 = new Beam([connectedNodes[1], node], globals);
            globals.addEdge(beam2);
            setHighlightedObj(node);
            globals.removeEdge(oldEdge);
            globals.controls.viewModeCallback();
        }
    });

    document.addEventListener('mousedown', function(e){

        switch (e.which) {
        case 1://left button
            mouseDown = true;

            if (beamInProgress){
                if (highlightedObj && highlightedObj.type == "node"){
                    if (beamInProgress.shouldBuildBeam(highlightedObj)){
                        globals.addEdge(new Beam([beamInProgress.node, highlightedObj], globals));
                        globals.controls.viewModeCallback();
                    }
                }
                beamInProgress.destroy();
                beamInProgress = null;
                globals.threeView.render();
            } else if (globals.addForceMode) {
                if (highlightedObj && highlightedObj.type == "node" && highlightedObj.externalForce === null){
                    var force = new Force(new THREE.Vector3(), globals);
                    highlightedObj.addExternalForce(force);
                    setHighlightedObj(force);
                }
                globals.addForceMode = false;
            }
            break;
        case 2://middle button
            break;
        case 3://right button

            if (highlightedObj && highlightedObj.type == "node"){
                //globals.threeView.enableControls(false);

            } else if (highlightedObj && highlightedObj.type == "beam"){
                //globals.threeView.enableControls(false);
                globals.controls.editMoreInfo(highlightedObj.getLength().toFixed(2), e, function(val){
                    console.log(val);
                });
            }

            break;
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
            setHighlightedObj(_highlightedObj);

            if (globals.viewMode == "length"){
                if (highlightedObj && highlightedObj.type == "beam"){
                    globals.controls.showMoreInfo("Length: " +
                            highlightedObj.getLength().toFixed(2) + " m", e);
                }
            } else if (globals.viewMode == "force"){
                if (highlightedObj && highlightedObj.type == "beam"){
                    globals.controls.showMoreInfo("Internal Force: " +
                            highlightedObj.getForce().toFixed(2) + " N", e);
                }
            }

        } else if (isDragging && highlightedObj){

            if (highlightedObj.type == "node"){
                if (globals.lockNodePositions) return;
                if (!isDraggingNode) {
                    isDraggingNode = true;
                    globals.threeView.enableControls(false);
                }
                var intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition());
                raycaster.ray.intersectPlane(raycasterPlane, intersection);
                highlightedObj.move(intersection);
                globals.controls.viewModeCallback();
            } else if (highlightedObj.type == "beam"){
            } else if (highlightedObj.type == "force"){
                if (globals.lockForces) return;
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

    function getPointOfIntersectionWithObject(object){
        var intersections = raycaster.intersectObjects([object], false);
        if (intersections.length > 0) {
            return intersections[0].point;
        }
        console.warn("no intersection found");
        return null;
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
                    objectFound = true;
                } else if (thing.object && thing.object._myBeam) {
                    _highlightedObj = thing.object._myBeam;
                    objectFound = true;
                } else if (thing.object && thing.object._myForce) {
                    _highlightedObj = thing.object._myForce;
                    objectFound = true;
                }
            });
        }
        return _highlightedObj;
    }

});