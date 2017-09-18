/**
 * Created by ghassaei on 10/27/16.
 */

globals = {};

$(function() {

    globals = initGlobals();

    var nodesInit = [
        [-360, 0, 0],
        [-360, 72, 0],
        [-240, 0, 0],
        [-240, 72, 0],
        [-120, 0, 0],
        [-120, 72, 0],
        [0, 0, 0],
        [0, 72, 0],
        [120, 0, 0],
        [120, 72, 0],
        [240, 0, 0],
        [240, 72, 0],
        [360, 0, 0],
        [360, 72, 0]
    ];

    var edgesInit = [
        [0,1],
        [2,3],
        [4,5],
        [6,7],
        [8,9],
        [10,11],
        [12,13],
        [0,2],
        [2,4],
        [4,6],
        [6,8],
        [8,10],
        [10,12],
        [1,3],
        [3,5],
        [5,7],
        [7,9],
        [9,11],
        [11,13],
        [1, 2],
        [3, 4],
        [5, 6],
        [6, 9],
        [8, 11],
        [10, 13]
    ];

    var forcesInit = [
        null,
        null,
        [0,-40,0],
        null,
        [0,-40,0],
        null,
        [0,-40,0],
        null,
        [0,-40,0],
        null,
        [0,-40,0],
        null,
        null,
        null
    ];

    var fixedInit = [
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true
    ];

    var linkedInit = [
        [7, [true, false]],
        [5, 9, [false, false]],
        [3, 11, [false, false]],
        [1, 13, [true, false]]
    ];

    globals.setModel(nodesInit, edgesInit, forcesInit, fixedInit, linkedInit);

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var raycasterPlane = new THREE.Plane(new THREE.Vector3(0,0,1));
    var highlightedObj;
    var isDragging = false;
    var isDraggingNode = false;
    var isDraggingForce = false;
    var mouseDown = false;

    var beamInProgress = null;
    var dummyFixed = new Node(new THREE.Vector3(), globals);
    globals.threeView.sceneRemove(dummyFixed.getObject3D());
    globals.threeView.scene.add(dummyFixed.getObject3D());
    dummyFixed.setFixed(true);
    dummyFixed.type = "dummy";
    dummyFixed.getObject3D().material = dummyFixed.getObject3D().material.clone();
    dummyFixed.getObject3D().material.transparent = true;
    dummyFixed.getObject3D().material.side = THREE.DoubleSide;
    dummyFixed.getObject3D().material.opacity = 0.5;
    dummyFixed.hide();

    var dummyForce = new Force(new THREE.Vector3(0,1,0), globals);
    globals.threeView.sceneRemove(dummyForce.getObject3D());
    globals.threeView.scene.add(dummyForce.getObject3D());
    dummyForce.type = "dummy";
    dummyForce.arrow.axis.material.transparent = true;
    dummyForce.arrow.axis.material.opacity = 0.5;
    dummyForce.arrow.cone.material.transparent = true;
    dummyForce.arrow.cone.material.side = THREE.DoubleSide;
    dummyForce.arrow.cone.material.opacity = 0.5;
    dummyForce.hide();


    function setHighlightedObj(object){
        if (highlightedObj && (object != highlightedObj)) {
            highlightedObj.unhighlight();
            globals.controls.hideMoreInfo();
        }
        highlightedObj = object;
        if (highlightedObj) highlightedObj.highlight();
        globals.threeView.render();
    }
    globals.setHighlightedObj = setHighlightedObj;

    var shift = false;
    $(document).on("keydown", function (e) {
        if (e.keyCode == 16){
            shift = true;
        }
    });
    $(document).on("keyup", function (e) {
        if (e.keyCode == 16){
            shift = false;
        } else if (e.keyCode == 13){
            globals.linked.link();
        } else if (e.keyCode == 27){
            globals.linked.deselectAll();
        }
        //console.log(e.keyCode);
    });


    $(document).dblclick(function() {
        if (highlightedObj && highlightedObj.type == "node"){
            if (globals.lockTopology) return;
            beamInProgress = new BeamBuilding(highlightedObj, highlightedObj.getPosition(), globals);
            (null);
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
            globals.solver.resetK_matrix();
            globals.solver.resetF_matrix();
            globals.solver.solve();
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
                globals.solver.resetK_matrix();
                globals.solver.resetF_matrix();
                globals.solver.solve();
                globals.threeView.render();
            } else if (globals.addForceMode) {
                dummyForce.hide();
                if (highlightedObj && highlightedObj.type == "node" && highlightedObj.externalForce === null){
                    var force = new Force(new THREE.Vector3(), globals);
                    highlightedObj.addExternalForce(force);
                    setHighlightedObj(force);
                    globals.gradient.sync();
                    globals.solver.solve();
                }
                globals.addForceMode = false;
                globals.threeView.render();
            } else if (globals.addRemoveFixedMode){
                globals.addRemoveFixedMode = false;
                dummyFixed.hide();
                if (highlightedObj && highlightedObj.type == "node"){
                    highlightedObj.setFixed(!highlightedObj.fixed);
                    globals.gradient.syncFixed();
                    globals.solver.solve();
                }
                globals.threeView.render();
            } else if (globals.deleteMode){
                globals.deleteMode = false;
                if (highlightedObj && highlightedObj.type == "node"){
                    var oldNode = highlightedObj;
                    setHighlightedObj(null);
                    globals.removeNode(oldNode);
                    globals.solver.solve();
                } else if (highlightedObj && highlightedObj.type == "beam"){
                    var oldEdge = highlightedObj;
                    setHighlightedObj(null);
                    globals.removeEdge(oldEdge);
                    globals.gradient.sync();
                    globals.solver.solve();
                } else if (highlightedObj && highlightedObj.type == "force"){
                    var oldForce = highlightedObj;
                    setHighlightedObj(null);
                    oldForce.destroy();
                    globals.gradient.sync();
                    globals.solver.solve();
                }
                globals.threeView.render();
            }
            break;
        case 2://middle button
            break;
        case 3://right button

            if (highlightedObj && highlightedObj.type == "node"){
                var position = highlightedObj.getPosition();
                globals.controls.editMoreInfoXY({x:position.x.toFixed(2), y:position.y.toFixed(2)}, e, function(val, axis){
                    val = parseFloat(val);
                    if (isNaN(val)) return;
                    var _position = highlightedObj.getPosition();
                    _position[axis] = val;
                    highlightedObj.moveManually(_position);
                    globals.linked.move(highlightedObj, _position);
                    globals.solver.resetK_matrix();
                    globals.solver.solve();
                    globals.threeView.render();
                });
            } else if (highlightedObj && highlightedObj.type == "beam"){
                //globals.controls.editMoreInfo(highlightedObj.getLength().toFixed(2), e, function(val){
                //    console.log(val);
                //});
            } else if (highlightedObj && highlightedObj.type == "force"){
                var force = highlightedObj.getForce();
                globals.controls.editMoreInfoXY({x:force.x.toFixed(2), y:force.y.toFixed(2)}, e, function(val, axis){
                    val = parseFloat(val);
                    if (isNaN(val)) return;
                    var _force = highlightedObj.getForce();
                    _force[axis] = val;
                    highlightedObj.setForce(_force);
                    globals.solver.resetF_matrix();
                    globals.gradient.resetF_matrix();
                    globals.solver.solve();
                    globals.threeView.render();
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
        if (shift && highlightedObj && highlightedObj.type == "node"){
            globals.linked.selectNode(highlightedObj);
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
            globals.gradient.hide();
            var objsToIntersect = globals.threeView.getObjToIntersect();
            _highlightedObj = checkForIntersections(e, objsToIntersect);
            setHighlightedObj(_highlightedObj);

            if (globals.addRemoveFixedMode){
                if (highlightedObj && highlightedObj.type == "node" && highlightedObj.fixed){
                    dummyFixed.hide();
                } else {
                    var intersection = getIntersectionWithObjectPlane(new THREE.Vector3());
                    dummyFixed.move(intersection);
                    dummyFixed.show();
                    globals.threeView.render();
                }
            } else if (globals.addForceMode){
                var intersection = getIntersectionWithObjectPlane(new THREE.Vector3());
                dummyForce.setOrigin(intersection);
                dummyForce.show();
                globals.threeView.render();
            }

            if (highlightedObj && highlightedObj.type == "force"){
                globals.controls.showMoreInfo("Force: " +
                            highlightedObj.getLength().toFixed(2) + " N", e);
            }

            if (globals.viewMode == "length"){
                if (highlightedObj && highlightedObj.type == "beam"){
                    globals.controls.showMoreInfo("Length: " +
                            highlightedObj.getLength().toFixed(2) + " m", e);
                }
            } else if (globals.viewMode == "force"){
                if (highlightedObj && highlightedObj.type == "beam"){
                    globals.controls.showMoreInfo("Internal Force: " +
                            Math.abs(highlightedObj.getForce()).toFixed(2) + " N", e);
                }
            } else if (globals.viewMode == "tensionCompression"){
                if (highlightedObj && highlightedObj.type == "beam"){
                    if (highlightedObj.isInCompression()){
                        globals.controls.showMoreInfo("Compression: " +
                            Math.abs(highlightedObj.getForce()).toFixed(2) + " N", e);
                    } else {
                        globals.controls.showMoreInfo("Tension: " +
                            Math.abs(highlightedObj.getForce()).toFixed(2) + " N", e);
                    }
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
                var data = "Position: " +
                            "&nbsp;&nbsp;  x : " + intersection.x.toFixed(2) + "&nbsp;  y : " + intersection.y.toFixed(2);
                if (!globals.xyOnly) data += "&nbsp;  z : " + intersection.z.toFixed(2);
                globals.controls.showMoreInfo(data  + " m", e);
                globals.linked.constrain(highlightedObj, intersection);
                highlightedObj.moveManually(intersection);
                globals.linked.move(highlightedObj, intersection);
                globals.solver.resetK_matrix();
                globals.solver.solve();
                globals.gradient.calcGrad(globals.linked.getLinked(highlightedObj), null, highlightedObj, intersection);
                globals.controls.viewModeCallback();
            } else if (highlightedObj.type == "beam"){
            } else if (highlightedObj.type == "force"){
                globals.controls.showMoreInfo("Force: " +
                            highlightedObj.getLength().toFixed(2) + " N", e);
                if (globals.lockForces) return;
                if (!isDraggingForce) {
                    isDraggingForce = true;
                    globals.threeView.enableControls(false);
                }
                var intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition());
                highlightedObj.move(intersection);
                globals.solver.resetF_matrix();
                globals.gradient.resetF_matrix();
                globals.solver.solve();
                globals.threeView.render();
            }
        }
    }

    function getIntersectionWithObjectPlane(position){
        var cameraOrientation = globals.threeView.camera.getWorldDirection();
        var dist = position.dot(cameraOrientation);
        if (globals.xyOnly) {
            raycasterPlane.set(new THREE.Vector3(0,0,1), 0);
        } else {
            raycasterPlane.set(cameraOrientation, -dist);
        }
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
                if (thing.object && thing.object._myNode && thing.object._myNode.type == "node"){
                    _highlightedObj = thing.object._myNode;
                    objectFound = true;
                } else if (thing.object && thing.object._myBeam && thing.object._myBeam.type == "beam") {
                    _highlightedObj = thing.object._myBeam;
                    objectFound = true;
                } else if (thing.object && thing.object._myForce && thing.object._myForce.type == "force") {
                    _highlightedObj = thing.object._myForce;
                    objectFound = true;
                }
            });
        }
        return _highlightedObj;
    }

});