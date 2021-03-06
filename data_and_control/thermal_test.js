/*
    This file heats a motor up to equilibrium then turns off the motor to 
    see how high the temp spikes. It cuts off when the temp passes the 
    temp the equilibrium test cut off at.
    
    Power:
      _____________      ____________
    _|             |____|            |___________________
    
    Temp:
                     __                __
                    /  `---.__        /  `---.__
      _____________/          \______/          ``---.___
    _/


*/
var motor = "Mega";
var sustainedPwm = 1700;

var filePrefix = "EqTest-" + motor + '-' + sustainedPwm;
var samplesAvg = 20;             // TODO: Figure out right sample average

var eqRunning = false;
var cutoffSample = null;
var sampleQueue = [];
var queueSum = 0;
var avg_motorOn = true;
var last_avg = 0;
var number_of_tests = 3;
var currentRunNum = 0;
var cutoffTime = 120;

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
    // rcb.console.print(JSON.stringify(result));

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

    if (eqRunning) {
        if (!windowAverage(dataPt)) {
            // Cut off the motor.
            rcb.console.print("Cut off motor.");
            rcb.output.pwm("escA", 1000);
            cutoffSample = dataPt;
            eqRunning = false;
        }
    }

    if (cutoffSample && (cutoffSample.time + cutoffTime) < dataPt.time) {
        // End test at cutoff temp
        cutoffSample = null;
        if (currentRunNum < number_of_tests) {
            startTest();
        } else {
            rcb.wait(end, 10 * 60);
        }
    }
}


function end() {
    rcb.endScript();
}

function UDPInitialized(){
    rcb.console.print("Start Motor Spinning");
    rcb.output.pwm("escA", 1220);
    rcb.wait(startTest, 4);
}

function startTest() {
    currentRunNum++;
    rcb.console.print("Starting test #", currentRunNum);
    rcb.output.ramp("escA", 1220, sustainedPwm, 10, eqTest);
    sampleQueue = [];
    queueSum = 0;
    avg_motorOn = true;
    eqRunning = false;
    cutoffSample = null;
    last_avg = 0;
}

function eqTest() {
    eqRunning = true;
}

function windowAverage(sample) {
    while (sampleQueue.length && sampleQueue[0].time < (sample.time - window)) {
        let removed = sampleQueue.shift();
        queueSum -= removed.temp;
    }

    sampleQueue.push(sample);
    queueSum += sample.temp;

    // Check for rounding errors.
    // let temps = sampleQueue.map(it => it["Motor Temp"])
    // let diff_sum = math.abs(queueSum - math.sum(temps))
    // let diff_avg = math.abs((queueSum/sampleQueue.length) - math.mean(temps))
    // if ( diff_sum > 1 || diff_avg > 1 ) {
        // console.log(queueSum, math.sum(temps))
        // console.log((queueSum/sampleQueue.length), math.mean(temps))
        // throw "Not same maths"
    // }

    let avg = queueSum / sampleQueue.length;
    let deltaAvg = math.abs(avg - last_avg);
    last_avg = avg;
    rcb.console.print(deltaAvg);
    if (sampleQueue.length > 60 && deltaAvg < 1e-5) {
        avg_motorOn = false;
    }
    
    return avg_motorOn;
}
