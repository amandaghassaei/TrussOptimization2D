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
        globals.deleteMode = false;
    });

    setLink("#addRemoveFixed", function(){
        globals.addForceMode = false;
        globals.addRemoveFixedMode = true;
        globals.deleteMode = false;
    });

    setLink("#deleteMode", function(){
        globals.addForceMode = false;
        globals.addRemoveFixedMode = false;
        globals.deleteMode = true;
    });

    setLink("#solve", function(){
        globals.solver.solve();
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
    setCheckbox("#xyOnly", globals.xyOnly, function(val){
        globals.xyOnly = val;
        globals.threeView.enableRotate(!val);
        if (val) globals.threeView.squareWithXY();
        globals.solver.solve();
    });
    globals.threeView.enableRotate(!globals.xyOnly);
    if (globals.xyOnly) globals.threeView.squareWithXY();

    var scaleHTML = "";
    for (var i=0;i<=20;i++){
        scaleHTML += "<div>";
        scaleHTML += "<div id='swatch" + i + "' class='colorSwatch'></div>";
        if (i%5 == 0) scaleHTML += "<span id='label" + i + "'></span>";
        scaleHTML += "</div>";
    }
    $("#scaleBars").html(scaleHTML);

    var scaleHTML = "";
    for (var i=0;i<=20;i++){
        scaleHTML += "<div>";
        scaleHTML += "<div id='tension" + i + "' class='colorSwatch'></div>";
        scaleHTML += "<div id='compression" + i + "' class='colorSwatch'></div>";
        if (i%5 == 0) scaleHTML += "<span id='labelCT" + i + "'></span>";
        scaleHTML += "</div>";
    }
    $("#tension-compressionScale").html(scaleHTML);

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

    function updateRedBlueScaleBars(max){
        for (var i=0;i<=20;i++){
            var val = (max-0)*(20-i)/20+0;
            $("#tension" + i).css("background", hexForRGBVal(val, max, false));
            $("#compression" + i).css("background", hexForRGBVal(val, max, true));
            if (i%5 == 0) $("#labelCT" + i).html(val.toFixed(2));
        }
    }
    function hexForRGBVal(val, max, isCompression){
        var scaledVal = Math.pow(val/max, 1/2);
        var color = new THREE.Color();
        if (isCompression) color.setRGB(scaledVal, 0, 0);
        else color.setRGB(0, 0, scaledVal);
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
                var force = Math.abs(globals.edges[i].getForce());
                if (globals.edges[i].isFixed()) force = null;
                data.push(force);
            }
        } else if (val == "deformation"){
            for (var i=0;i<globals.edges.length;i++){
                var deformation = Math.abs(globals.edges[i].getDeformation());
                if (deformation == 0) deformation = null;
                data.push(deformation);
            }
        } else if (val == "tensionCompression"){
            for (var i=0;i<globals.edges.length;i++){
                var force = Math.abs(globals.edges[i].getForce());
                data.push(force);
            }
            var max = _.max(data);
            for (var i=0;i<globals.edges.length;i++){
                var edge = globals.edges[i];
                edge.redBlueColor(data[i], max);
            }
            updateRedBlueScaleBars(max);
            globals.threeView.render();
            return;
        }
        var noNulls = _.without(data, null);
        var max = _.max(noNulls);
        var min = _.min(noNulls);
        for (var i=0;i<globals.edges.length;i++){
            var edge = globals.edges[i];
            edge.setHSLColor(data[i], max, min);
        }
        updateScaleBars(min, max);
        globals.threeView.render();
    }
    function viewModeChange(val){
        globals.viewMode = val;
        var $scaleBars = $("#scaleBars");
        var $controls = $("#controls");
        var $redBlue = $("#tension-compressionScale");
        if (val == "geometry"){
            $scaleBars.animate({right: -100});
            $redBlue.animate({right: -100});
            $controls.animate({right:0});
        } else if (val == "length"){
            $scaleBars.show();
            $redBlue.hide();
            $scaleBars.animate({right: 0});
            $redBlue.animate({right: 0});
            $controls.animate({right:100});
        } else if (val == "force"){
            $scaleBars.show();
            $redBlue.hide();
            $scaleBars.animate({right: 0});
            $redBlue.animate({right: 0});
            $controls.animate({right:100});
        } else if (val == "tensionCompression"){
            $scaleBars.hide();
            $redBlue.show();
            $scaleBars.animate({right: 0});
            $redBlue.animate({right: 0});
            $controls.animate({right:100});
        }
        viewModeCallback();
    }
    setRadio("viewMode", globals.viewMode, viewModeChange);
    viewModeChange(globals.viewMode);

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

    setInput("#gradStepSize", globals.gradStepSize, function(val){
        globals.gradStepSize = val;
    }, 0.0001);

    setLink("#optimize", function(){
        $("#pauseOptimization").show();
        $("#optimize").hide();
        globals.gradient.startOptimization();
    });
    setLink("#pauseOptimization", function(){
        $("#pauseOptimization").hide();
        $("#optimize").show();
        globals.gradient.pauseOptimization();
    });


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
        viewModeCallback: viewModeCallback,
        setRadio: setRadio
    }
}