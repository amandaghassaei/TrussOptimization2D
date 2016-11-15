/**
 * Created by ghassaei on 9/16/16.
 */

function initThreeView(globals) {

    var scene = new THREE.Scene();
    var secondPassScene = new THREE.Scene();
    var thirdPassScene = new THREE.Scene();
    var wrapper = new THREE.Object3D();
    var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -1000, 1000);//-40, 40);
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = false;
    var controls;

    var animating = false;

    init();

    function init() {

        var container = $("#threeContainer");
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.append(renderer.domElement);

        scene.background = new THREE.Color(0xf4f4f4);
        scene.add(wrapper);
        //var directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        //directionalLight1.position.set(0, 100, 0);
        //scene.add(directionalLight1);
        //var directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.3);
        //directionalLight4.position.set(0, -100, 0);
        //scene.add(directionalLight4);
        //var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        //directionalLight2.position.set(100, -30, 0);
        //scene.add(directionalLight2);
        //var directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
        //directionalLight3.position.set(-100, -30, 0);
        //scene.add(directionalLight3);
        //var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        //scene.add(ambientLight);
        //scene.fog = new THREE.FogExp2(0xf4f4f4, 1.7);
        //renderer.setClearColor(scene.fog.color);

        camera.zoom = 1;
        camera.updateProjectionMatrix();
        camera.position.x = 40;
        camera.position.y = 40;
        camera.position.z = 40;

        controls = new THREE.OrbitControls(camera, container.get(0));
        controls.addEventListener('change', render);

        render();
    }

    function render() {
        if (!animating) _render();
    }

    function startAnimation(callback){
        animating = true;
        console.log("starting animation");
        _loop(function(){
            callback();
            _render();
        });
    }

    function stopAnimation(){
        console.log("stop animation");
        animating = false;
    }

    function _render(){
        renderer.clear();
        renderer.render(scene, camera);
        renderer.clearDepth();
        renderer.render(thirdPassScene, camera);
        renderer.clearDepth();
        renderer.render(secondPassScene, camera);
    }

    function _loop(callback){
        callback();
        requestAnimationFrame(function(){
            if (animating) _loop(callback);
        });
    }

    function secondPassSceneAdd(object){
        secondPassScene.add(object);
    }
    function secondPassSceneRemove(object){
        secondPassScene.remove(object);
    }

    function thirdPassSceneAdd(object){
        thirdPassScene.add(object)
    }
    function thirdPassSceneRemove(object){
        thirdPassScene.remove(object);
    }

    function sceneAdd(object) {
        wrapper.add(object);
    }

    function sceneRemove(object) {
        wrapper.remove(object);
    }

    function sceneClear() {
        wrapper.children = [];
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.left = -window.innerWidth / 2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = -window.innerHeight / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        render();
    }

    function enableControls(state){
        controls.enabled = state;
        if (!globals.xyOnly) controls.enableRotate = state;
    }
    function enableRotate(state){
        controls.enableRotate = state;
    }

    function squareWithXY(){
        controls.reset();
        camera.position.x = 0;
        camera.position.y = 0;
        camera.lookAt(new THREE.Vector3(0,0,0));
        render();
    }

    function getObjToIntersect(){
        return thirdPassScene.children.concat(wrapper.children);
    }

    return {
        getObjToIntersect: getObjToIntersect,
        sceneRemove: sceneRemove,
        sceneAdd: sceneAdd,
        sceneClear: sceneClear,
        render: render,
        onWindowResize: onWindowResize,
        startAnimation: startAnimation,
        stopAnimation: stopAnimation,
        enableControls: enableControls,
        enableRotate: enableRotate,
        squareWithXY: squareWithXY,
        secondPassSceneAdd: secondPassSceneAdd,
        secondPassSceneRemove: secondPassSceneRemove,
        thirdPassSceneAdd: thirdPassSceneAdd,
        thirdPassSceneRemove: thirdPassSceneRemove,
        scene: scene,
        camera: camera
    }
}