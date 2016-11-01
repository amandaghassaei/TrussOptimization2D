/**
 * Created by ghassaei on 10/31/16.
 */


function initGlobals(){
    var _globals = {

        //edit geo
        addForceMode: false,

        viewMode: "geometry",

        lockForces: false,
        lockTopology: false,
        lockNodePositions: false
    };

    _globals.threeView = initThreeView(_globals);
    _globals.controls = initControls(_globals);

    return _globals;
}