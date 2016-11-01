/**
 * Created by ghassaei on 10/31/16.
 */


function initControls(globals){

    window.addEventListener('resize', function(){
        globals.threeView.onWindowResize();
    }, false);

    $("#logo").mouseenter(function(){
        $("#activeLogo").show();
        $("#inactiveLogo").hide();
    });
    $("#logo").mouseleave(function(){
        $("#inactiveLogo").show();
        $("#activeLogo").hide();
    });

    setLink("#about", function(){
        $('#aboutModal').modal('show');
    });

    setLink("#addForce", function(){
        globals.addRemoveFixedMode = false;
        globals.addForceMode = true;
    });

    setLink("#addRemoveFixed", function(){
        globals.addForceMode = false;
        globals.addRemoveFixedMode = true;
    });

    setCheckbox("#lockForces", globals.lockForces, function(val){
        globals.lockForces = val;
    });
    setCheckbox("#lockTopology", globals.lockTopology, function(val){
        globals.lockTopology = val;
    });
    setCheckbox("#lockNodePositions", globals.lockNodePositions, function(val){
        globals.lockNodePositions = val;
    });

    var scaleHTML = "";
    for (var i=0;i<=20;i++){
        scaleHTML += "<div>";
        scaleHTML += "<div id='swatch" + i + "' class='colorSwatch'></div>";
        if (i%5 == 0) scaleHTML += "<span id='label" + i + "'></span>";
        scaleHTML += "</div>";
    }
    $("#scaleBars").html(scaleHTML);

    function updateScaleBars(min, max){
        for (var i=0;i<=20;i++){
            var val = (max-min)*(20-i)/20+min;
            $("#swatch" + i).css("background", hexForVal(val, min, max));
            if (i%5 == 0) $("#label" + i).html(val.toFixed(2));
        }
    }
    function hexForVal(val, min, max){
        var scaledVal = (1-(val - min)/(max - min)) * 0.7;
        var color = new THREE.Color();
        color.setHSL(scaledVal, 1, 0.5);
        return "#" + color.getHexString();
    }

    function viewModeCallback(){
        var val = globals.viewMode;
        var data = [];
        if (val == "geometry"){
            _.each(globals.edges, function(edge){
                edge.setDefaultColor();
            });
            globals.threeView.render();
            return;
        } else if (val == "length"){
            for (var i=0;i<globals.edges.length;i++){
                var edge = globals.edges[i];
                data.push(edge.getLength());
            }
        } else if (val == "force"){
            for (var i=0;i<globals.edges.length;i++){
                var edge = globals.edges[i];
                data.push(i);
            }
        }
        var max = _.max(data);
        var min = _.min(data);
        for (var i=0;i<globals.edges.length;i++){
            var edge = globals.edges[i];
            edge.setHSLColor(data[i], max, min);
        }
        updateScaleBars(min, max);
        globals.threeView.render();
    }
    setRadio("viewMode", globals.viewMode, function(val){
        globals.viewMode = val;
        var $scaleBars = $("#scaleBars");
        var $controls = $("#controls");
        if (val == "geometry"){
            $scaleBars.animate({right: -100});
            $controls.animate({right:0});
        } else if (val == "length"){
            $scaleBars.animate({right: 0});
            $controls.animate({right:100});
        } else if (val == "force"){
            $scaleBars.animate({right: 0});
            $controls.animate({right:100});
        }
        viewModeCallback();
    });

    var $moreInfo = $("#moreInfo");
    var $moreInfoInput = $("#moreInfo>input");
    var $moreInfoSpan = $("#moreInfo>span");
    function showMoreInfo(string, e){
        $moreInfo.children("span").html(string);
        $moreInfo.css({top: e.clientY - 50, left: e.clientX + 10});
        $moreInfoSpan.show();
        $moreInfoInput.hide();
        $moreInfo.show();
    }
    function hideMoreInfo(){
        $moreInfo.hide();
        $moreInfoInput.unbind("change");
    }
    function editMoreInfo(val, e, callback){
        var $moreInfo = $("#moreInfo");
        $moreInfo.css({top: e.clientY - 50, left: e.clientX + 10});
        $moreInfoInput.show();
        $moreInfoSpan.hide();
        $moreInfo.show();
        $moreInfoInput.focus();
        //$moreInfoInput.val("");
        $moreInfoInput.val(val);
        $moreInfoInput.change(function(){
            $moreInfoInput.hide();
            $moreInfoInput.unbind("change");
            $moreInfo.hide();
            var newVal = $moreInfoInput.val();
            if (isNaN(parseFloat(newVal))) return;
            newVal = parseFloat(newVal);
            callback(newVal);
        });
    }


    function setLink(id, callback){
        $(id).click(function(e){
            e.preventDefault();
            callback(e);
        });
    }

    function setRadio(name, val, callback){
        $("input[name=" + name + "]").on('change', function() {
            var state = $("input[name="+name+"]:checked").val();
            callback(state);
        });
        $(".radio>input[value="+val+"]").prop("checked", true);
    }

    function setInput(id, val, callback, min, max){
        var $input = $(id);
        $input.change(function(){
            var val = $input.val();
            if ($input.hasClass("int")){
                if (isNaN(parseInt(val))) return;
                val = parseInt(val);
            } else {
                if (isNaN(parseFloat(val))) return;
                val = parseFloat(val);
            }
            if (min !== undefined && val < min) val = min;
            if (max !== undefined && val > max) val = max;
            $input.val(val);
            callback(val);
        });
        $input.val(val);
    }

    function setCheckbox(id, state, callback){
        var $input  = $(id);
        $input.on('change', function () {
            if ($input.is(":checked")) callback(true);
            else callback(false);
        });
        $input.prop('checked', state);
    }

    function setSlider(id, val, min, max, incr, callback, callbackOnStop){
        var slider = $(id).slider({
            orientation: 'horizontal',
            range: false,
            value: val,
            min: min,
            max: max,
            step: incr
        });
        slider.on("slide", function(e, ui){
            var val = ui.value;
            callback(val);
        });
        slider.on("slidestop", function(){
            var val = slider.slider('value');
            if (callbackOnStop) callbackOnStop(val);
        })
    }

    function setSliderInput(id, val, min, max, incr, callback){

        var slider = $(id+">div").slider({
            orientation: 'horizontal',
            range: false,
            value: val,
            min: min,
            max: max,
            step: incr
        });

        var $input = $(id+">input");
        $input.change(function(){
            var val = $input.val();
            if ($input.hasClass("int")){
                if (isNaN(parseInt(val))) return;
                val = parseInt(val);
            } else {
                if (isNaN(parseFloat(val))) return;
                val = parseFloat(val);
            }

            var min = slider.slider("option", "min");
            if (val < min) val = min;
            if (val > max) val = max;
            $input.val(val);
            slider.slider('value', val);
            callback(val);
        });
        $input.val(val);
        slider.on("slide", function(e, ui){
            var val = ui.value;
            $input.val(val);
            callback(val);
        });
    }

    return {
        showMoreInfo: showMoreInfo,
        hideMoreInfo: hideMoreInfo,
        editMoreInfo: editMoreInfo,
        viewModeCallback: viewModeCallback
    }
}