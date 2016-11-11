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
        var $button = $("#optimize");
        if (linked.length == 0){
            $linkedNodes.html("<b>No Nodes Selected</b> (Shift+click to select a node or a group of nodes, Enter to add them to list.)");
            $button.hide();
            return;
        }
        var string = "";
        for (var i=0;i<linked.length;i++){
            var group = linked[i];
            string += '<label class="radio"> <input name="visibleLinked" value="' + i + '" data-toggle="radio" class="custom-radio" type="radio"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>';
            string += "[ ";
            for (var j=0;j<group.length;j++){
                string += "Node " + globals.nodes.indexOf(group[j]);
                if (j<group.length-1) string += ", ";
            }
            string += ' ] <a href="#" data-index="' + i + '" class="deleteLinked"><span class="fui-cross"></span></a></label>';
        }
        $linkedNodes.html(string);
        $(".deleteLinked").click(function(e){
            e.preventDefault();
            deleteLink($(e.target).parent().data("index"));
        });
        globals.controls.setRadio("visibleLinked", linked.length-1, function(val){
            console.log(val);
        });
        $button.show();
    }

    function deleteLink(index){
        if (isNaN(index)) return;
        if (index<0) return;
        linked.splice(index, 1);
        display();
    }

    function deselectAll(){
        selectedNodes = [];
    }

    function selectNode(node){
        var index = selectedNodes.indexOf(node);
        if (index > -1) {
            selectedNodes.splice(index, 1);
        } else {
            selectedNodes.push(node);
        }
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

    return {
        deleteNode: deleteNode,
        deselectAll: deselectAll,
        selectNode: selectNode,
        link: link,
        linked: linked
    }

}