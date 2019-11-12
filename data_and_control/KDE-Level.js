var motor = "KDE";
var sustainedPwm = 1200;
var testLength = 5 * 60;

var filePrefix = "PostBurnLevel-" + motor + "-" + sustainedPwm;
var samplesAvg = 20;
var spikeMaxTemp = -1;

var cutoff = false;

// UDP stream for analysis
var receive_port = 55047; 
var send_ip = "127.0.0.1"; 
var send_port = 64126; 

rcb.udp.init(receive_port, send_ip, send_port, UDPInitialized);
rcb.files.newLogFile({prefix: filePrefix});
readSensor();

function readSensor(){
    rcb.console.setVerbose(false);
    rcb.sensors.read(readDone, samplesAvg);
    rcb.console.setVerbose(true);
}

function readDone(result){
    //rcb.console.print(JSON.stringify(result));

    rcb.console.setVerbose(false);
    rcb.files.newLogEntry(result,readSensor);
    rcb.console.setVerbose(true);

    var dataPt = {};
    dataPt.time = result.time.displayValue;
    dataPt.temp = result.temp4LHE.displayValue;
    dataPt.ambTemp = result.temp66NA.displayValue;
    dataPt.escTemp = result.temp319A.displayValue;
    dataPt.pwm = result.escA.displayValue;
    dataPt.voltage = result.voltage.displayValue;
    dataPt.current = result.current.displayValue;
    dataPt.power = result.electricalPower.displayValue;
    dataPt.rpm = result.motorOpticalSpeed.displayValue;
    
    // UDP Stream data
    var buffer = rcb.udp.str2ab(JSON.stringify(dataPt));
    rcb.udp.send(buffer);

    if (dataPt.time > testLength || dataPt.temp > 130) {
        rcb.output.pwm("escA", 1000);
        cutoff = true;
    }

    if (cutoff){
        if (dataPt.temp > spikeMaxTemp) {
            spikeMaxTemp = dataPt.temp;
        }
        if (dataPt.temp < (spikeMaxTemp - 1)) {
            rcb.endScript();
        }
    }
}

function end() {
    rcb.endScript();
}

function UDPInitialized(){
    rcb.console.print("Start Motor Spinning");
    //rcb.output.pwm("escA", 1220);
    rcb.output.ramp("escA", 1000, 1200, 4, startTest);
}

function startTest() {
    rcb.output.ramp("escA", 1200, sustainedPwm, 10, eqTest);
}

function eqTest() {}