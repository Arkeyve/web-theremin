(function() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var o = null;
    var g = null;

    var thereminBox = null;

    var freqMul = null;
    var gainMul = null;
    var playing = false;

    const gainMax = 1;
    const freqMax = 750;

    const fps = 30;
    const videoInterval = (1/fps) * 1000;

    var webcam = null;
    var canvas = null;
    var ctx = null;

    const modelParams = {
        flipHorizontal: true, // flip e.g for video
        maxNumBoxes: 1, // maximum number of boxes to detect
        iouThreshold: 0.5, // ioU threshold for non-max suppression
        scoreThreshold: 0.6, // confidence threshold for predictions.
    }

    function launchWebcam() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        var canvasHeight = canvas.parentElement.offsetHeight;
        var canvasWidth = canvas.parentElement.offsetWidth;
        canvas.setAttribute("height", canvasHeight);
        canvas.setAttribute("width", canvasWidth);

        webcam = document.getElementById("webcam");
        webcam.setAttribute("height", canvasHeight);
        webcam.setAttribute("width", canvasWidth);

        handTrack.startVideo(webcam).then(status => {
            if(status) {
                handTrack.load(modelParams).then(model => {
                    if(!playing) {
                        startTheremin();
                    }
                    predict(model);
                });
            }
        });

        enableBtns();
    }

    function predict(model) {
        model.detect(webcam).then(predictions => {
            // console.log(predictions);
            if(predictions[0]) {
                let midX = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
                let midY = predictions[0].bbox[1] + (predictions[0].bbox[2] / 2)
                playTheremin(midX * freqMul, gainMax - (midY * gainMul));
            }
            model.renderPredictions(predictions, canvas, ctx, webcam);

            setTimeout(() => {
                predict(model);
            }, 10);
        });
    }

    function enableBtns() {
        thereminBox = document.getElementById("theremin-box");
        freqMul = freqMax / thereminBox.offsetWidth;
        gainMul = gainMax / thereminBox.offsetHeight;

        thereminBox.addEventListener("click", function() {
            if(!playing) {
                startTheremin();
            }
        });

        // thereminBox.addEventListener("mousemove", function(e) {
        //     playTheremin(e.offsetX * freqMul, gainMax - (e.offsetY * gainMul));
        // });
        //
        // thereminBox.addEventListener("mouseout", function(e) {
        //     stopTheremin();
        // });
    }

    function startTheremin() {
        o = context.createOscillator();
        g = context.createGain();
        o.connect(g);
        g.connect(context.destination);
        o.frequency.value = 440;
        g.gain.value = 0;
        o.start(0);
        playing = true;
    }

    function playTheremin(freqVal, gainVal) {
        if(playing) {
            o.frequency.value = Number(freqVal);
            g.gain.value = Number(gainVal);
        }
    }

    function stopTheremin() {
        if(playing) {
            g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime);
        }
    }

    window.addEventListener("load", function() {
        launchWebcam();
    });
})();
