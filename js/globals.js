/**
 * Created by ghassaei on 10/31/16.
 */


function initGlobals(){
    var _globals = {

        //edit geo
        addForceMode: false,

        viewMode: "geometry"
    };

    _globals.threeView = initThreeView(_globals);
    _globals.controls = initControls(_globals);

    return _globals;
}