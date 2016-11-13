/**
 * Created by ghassaei on 11/11/16.
 */


function initLinked(globals){

    var linked = [];
    var selectedNodes = [];

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(new THREE.Vector3(-1000,0,0));
    lineGeometry.vertices.push(new THREE.Vector3(1000,0,0));
    lineGeometry.computeLineDistances();
    var symmetryLine = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({transparent: true, opacity: 0.5,  dashSize: 1, gapSize: 1, linewidth:2, color:0x8cbaed}));
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
            display();
        }
    }

    function display(){
        var $linkedNodes = $("#linkedNodes");
        var $options = $("#gradOptions");
        var $symmetryOptions = $("#symmetryOptions");
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
            string += '<label class="radio"> <input name="visibleLinked" value="' + i + '" data-toggle="radio" class="custom-radio" type="radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>';
            for (var j=0;j<group.length;j++){
                string += "Node " + globals.nodes.indexOf(group[j]);
                if (j<group.length-1) string += ", ";
            }
            string += ' <a href="#" data-index="' + i + '" class="deleteLinked"><span class="fui-cross"></span></a></label>';
        }
        string += '<label class="radio"> <input name="visibleLinked" value="-1" data-toggle="radio" class="custom-radio" type="radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>';
        string += "Show all Optimization Nodes";
        string += '</label>';
        $linkedNodes.html(string);
        $(".deleteLinked").click(function(e){
            e.preventDefault();
            deleteLink($(e.target).parent().data("index"));
        });

        if (showSymmetry) $symmetryOptions.show();
        else $symmetryOptions.hide();
        symmetryLine.visible = showSymmetry;

        var selectionCallback = function(val){
            deselectAll();
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
        globals.controls.setRadio("visibleLinked", -1, selectionCallback);
        selectionCallback(-1);
        $options.show();
    }

    function deleteLink(index){
        if (isNaN(index)) return;
        if (index<0) return;
        linked.splice(index, 1);
        for (var i=0;i<globals.nodes.length;i++){
            globals.nodes[i].setSelected(false);
        }
        for (var i=0;i<selectedNodes.length;i++){
            selectedNodes[i].setSelected(true);
        }
        globals.threeView.render();
        display();
    }

    function deselectAll(){
        for (var i=0;i<globals.nodes.length;i++){
            globals.nodes[i].setSelected(false);
        }
        selectedNodes = [];
        globals.threeView.render();
    }

    function selectNode(node){
        var index = selectedNodes.indexOf(node);
        if (index > -1) {
            selectedNodes[index].setSelected(false);
            selectedNodes.splice(index, 1);
        } else {
            selectedNodes.push(node);
            if (selectedNodes.length>2){
                selectedNodes[0].setSelected(false);
                selectedNodes.shift();
            }
        }
        //for (var i=0;i<globals.nodes.length;i++){
        //    globals.nodes[i].setSelected(false);
        //}
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
            if (linked[i].length == 0) linked.splice(i, 1);
        }
        linked.push(selectedNodes);
        deselectAll();
        display();
    }

    function move(node, position){
        for (var i=0;i<linked.length;i++){
            var index = linked[i].indexOf(node);
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
        move: move,
        getLinked: getLinked,
        setSymmetryAngle: setSymmetryAngle,
        setSymmetryPoint: setSymmetryPoint,
        getSymmetricPosition: getSymmetricPosition
    }

}