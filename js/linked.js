/**
 * Created by ghassaei on 11/11/16.
 */


function initLinked(globals){

    var linked = [];
    var selectedNodes = [];

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
        if (linked.length == 0){
            $linkedNodes.html("<b>No Nodes Selected</b> (Shift+click to select a node or a group of nodes, Enter to add them to list.)");
            $options.hide();
            return;
        }
        var string = "";
        for (var i=0;i<linked.length;i++){
            var group = linked[i];
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
        var selectionCallback = function(val){
            deselectAll();
            if (val < -1){
            } else if (val == -1){
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
        display();
        for (var i=0;i<globals.nodes.length;i++){
            globals.nodes[i].setSelected(false);
        }
        for (var i=0;i<selectedNodes.length;i++){
            selectedNodes[i].setSelected(true);
        }
        globals.threeView.render();
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
                var reflected = position.clone();
                reflected.x *= -1;
                for (var j=0;j<linked[i].length;j++){
                    if (j == index) continue;
                    linked[i][j].moveManually(reflected);
                }
                return;
            }
        }
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
        getLinked: getLinked
    }

}