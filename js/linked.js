/**
 * Created by ghassaei on 11/11/16.
 */


function initLinked(globals){

    var linked = [];
    var locked = [];
    var selectedNodes = [];

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(new THREE.Vector3(-1000,0,0));
    lineGeometry.vertices.push(new THREE.Vector3(1000,0,0));
    lineGeometry.computeLineDistances();
    var symmetryLine = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({transparent: true, opacity: 0.5,  dashSize: 10, gapSize: 10, linewidth:2, color:0x8cbaed}));
    globals.threeView.sceneAdd(symmetryLine);
    setSymmetryAngle(globals.symmetryAngle);
    setSymmetryPoint(globals.symmetryPoint);

    function setSymmetryAngle(val){
        symmetryLine.rotation.z = Math.PI*val/180;
    }
    function setSymmetryPoint(point){
        symmetryLine.position.set(point.x, point.y, point.z);
    }



    display();


    function deleteNode(node){
        for (var i=0;i<linked.length;i++){
            var index = linked[i].indexOf(node);
            if (index > -1){
                linked[i].splice(index, 1);
            }
        }
        for (var i = linked.length-1; i >= 0; i--) {
            if (linked[i].length == 0) {
                linked.splice(i, 1);
                locked.splice(i, 1);
            }
        }
        display();
    }

    function display(){
        var $linkedNodes = $("#linkedNodes");
        var $options = $("#gradOptions");
        var $symmetryOptions = $(".symmetryOptions");
        if (linked.length == 0){
            $linkedNodes.html("<b>No Nodes Selected</b> (Shift+click to select a node or a group of nodes, Enter to add them to list.)");
            $options.hide();
            symmetryLine.visible = false;
            return;
        }
        var showSymmetry = false;
        var string = "";
        for (var i=0;i<linked.length;i++){
            var group = linked[i];
            if (group.length == 2) showSymmetry = true;
            string += '<div class="optVariable">';
            string += '<label class="radio"> <input name="visibleLinked" value="' + i + '" data-toggle="radio" class="custom-radio" type="radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>';
            string += "Node";
            if (group.length>1) string += "s";
            string += " ";
            for (var j=0;j<group.length;j++){
                string += globals.nodes.indexOf(group[j]);
                if (j<group.length-1) string += ", ";
            }
            string += '</label>';
            string += ' <a href="#" data-index="' + i + '" class="deleteLinked"><span class="fui-cross"></span></a>';
            string += '<div class="optLocks"><label class="checkbox" for="lock' + i + '0">' +
                '<input id="lock' + i + '0" data-toggle="checkbox" class="custom-checkbox"';
            if (locked[i][0]) string += ' checked="checked"';
            string += ' type="checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>' +
                'Lock X </label>';
            string += '<label class="checkbox" for="lock' + i + '1">' +
                '<input id="lock' + i + '1" data-toggle="checkbox" class="custom-checkbox"';
            if (locked[i][1]) string += ' checked="checked"';
            string += ' type="checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>' +
                'Lock Y </label></div>';
            string += '</div>';
        }
        string += '<label class="radio"> <input name="visibleLinked" value="-1" data-toggle="radio" class="custom-radio" type="radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>';
        string += "Show all Optimization Variables";
        string += '</label>';
        $linkedNodes.html(string);
        $(".optLocks .custom-checkbox").click(function(e){
            var id = $(e.target).attr('id');
            var axis = id.charAt(id.length - 1);
            var index = id.charAt(id.length - 2);
            locked[index][axis] = !locked[index][axis];
            for (var a=0;a<linked[index].length;a++){
                linked[index][a].setOptVis(axis, !locked[index][axis]);
            }
            globals.threeView.render();
        });
        $(".deleteLinked").click(function(e){
            e.preventDefault();
            deleteLink($(e.target).parent().data("index"));
        });

        if (showSymmetry) $symmetryOptions.show();
        else $symmetryOptions.hide();
        symmetryLine.visible = showSymmetry;

        globals.controls.setRadio("visibleLinked", -1, selectionCallback);
        selectionCallback(-1);
        $options.show();
    }
    var selectionCallback = function(val, noClearSelected){
        for (var i=0;i<globals.nodes.length;i++){
            globals.nodes[i].setSelected(false);
        }
        if (noClearSelected === undefined)selectedNodes = [];
        if (val == -1){
            for (var j=0;j<linked.length;j++) {
                for (var i = 0; i < linked[j].length; i++) {
                    linked[j][i].setSelected(true);
                }
            }
        } else {
            for (var i=0;i<linked[val].length;i++){
                linked[val][i].setSelected(true);
            }
        }
        globals.threeView.render();
    };

    function deleteLink(index){
        if (isNaN(index)) return;
        if (index<0) return;
        linked.splice(index, 1);
        locked.splice(index, 1);
        for (var i=0;i<globals.nodes.length;i++){
            globals.nodes[i].setSelected(false);
        }
        for (var i=0;i<selectedNodes.length;i++){
            selectedNodes[i].setSelected(true);
        }
        globals.threeView.render();
        display();
    }

    function deselectAll(noClearSelected){
        for (var i=0;i<globals.nodes.length;i++){
            globals.nodes[i].setSelected(false);
        }
        if (noClearSelected === undefined) {
            selectedNodes = [];
        }
        var visibleLinked = $("input[name=visibleLinked]:checked");
        if (visibleLinked.length>0) {
            selectionCallback(visibleLinked.val(), noClearSelected);
            for (var i=0;i<linked.length;i++){
                for (var j=0;j<linked[i].length;j++){
                    linked[i][j].setOptVis(0, !locked[i][0]);
                    linked[i][j].setOptVis(1, !locked[i][1]);
                }
            }
        }
        globals.threeView.render();
    }

    function removeNode(node){
        for (var i = 0; i < linked.length; i++) {
            var index = linked[i].indexOf(node);
            if (index > -1) {
                linked[i].splice(index, 1);
            }
        }
        for (var i = linked.length-1; i >= 0; i--) {
            if (linked[i].length == 0) {
                linked.splice(i, 1);
                locked.splice(i, 1);
            }
        }
        deselectAll();
        display();
    }

    function selectNode(node){
        var index = selectedNodes.indexOf(node);
        if (index > -1) {
            deselectAll(true);
            selectedNodes.splice(index, 1);
        } else {
            selectedNodes.push(node);
            if (selectedNodes.length>2){
                deselectAll(true);
                selectedNodes.shift();
            }
        }
        for (var i=0;i<selectedNodes.length;i++){
            selectedNodes[i].setSelected(true, true);
        }
        globals.threeView.render();
    }

    function link(){
        if (selectedNodes.length == 0) return;
        for (var j=0;j<selectedNodes.length;j++) {
            var node = selectedNodes[j];
            for (var i = 0; i < linked.length; i++) {
                var index = linked[i].indexOf(node);
                if (index > -1) {
                    linked[i].splice(index, 1);
                }
            }
        }
        for (var i = linked.length-1; i >= 0; i--) {
            if (linked[i].length == 0) {
                linked.splice(i, 1);
                locked.splice(i, 1);
            }
        }
        linked.push(selectedNodes);
        locked.push([false, false]);
        deselectAll();
        display();
    }

    function constrain(node, position){
        for (var i=0;i<linked.length;i++){
            var index = linked[i].indexOf(node);
            if (index >= 0){
                if (locked[i][0]){
                    position.x = node.getPosition().x;
                }
                if (locked[i][1]){
                    position.y = node.getPosition().y;
                }
            }
        }
        return position;
    }

    function move(node, position){
        for (var i=0;i<linked.length;i++){
            var index = linked[i].indexOf(node);
            if (locked[i][0]){
                position.x = node.getPosition().x;
            }
            if (index >= 0){
                var reflected = getSymmetricPosition(position);
                for (var j=0;j<linked[i].length;j++){
                    if (j == index) continue;
                    linked[i][j].moveManually(reflected);
                }
                return;
            }
        }
    }

    function getSymmetricPosition(position){
        var reflection = position.clone();
        var a = Math.tan(Math.PI*globals.symmetryAngle/180);
        var d = (position.x + position.y*a)/(1+a*a);
        reflection.x = 2*d-position.x;
        reflection.y = 2*d*a-position.y;
        return reflection;
    }

    function getLinked(node){
        for (var i=0;i<linked.length;i++){
            var index = linked[i].indexOf(node);
            if (index >= 0){
                return linked[i];
            }
        }
        return [node];
    }

    return {
        deleteNode: deleteNode,
        deselectAll: deselectAll,
        selectNode: selectNode,
        link: link,
        linked: linked,
        locked: locked,
        move: move,
        constrain: constrain,
        getLinked: getLinked,
        setSymmetryAngle: setSymmetryAngle,
        setSymmetryPoint: setSymmetryPoint,
        getSymmetricPosition: getSymmetricPosition,
        display: display,
        removeNode: removeNode
    }

}