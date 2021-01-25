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

    function enableBtns() {
        thereminBox = document.getElementById("theremin-box");
        freqMul = freqMax / thereminBox.offsetWidth;
        gainMul = gainMax / thereminBox.offsetHeight;

        thereminBox.addEventListener("click", function() {
            if(!playing) {
                startTheremin();
            }
        });

        thereminBox.addEventListener("mousemove", function(e) {
            playTheremin(e.offsetX * freqMul, gainMax - (e.offsetY * gainMul));
        });

        thereminBox.addEventListener("mouseout", function(e) {
            stopTheremin();
        })
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
        enableBtns();
    });
})();
