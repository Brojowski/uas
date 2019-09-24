/*
    This file heats a motor up to equilibrium then turns off the motor to 
    see how high the temp spikes. It cuts off when the temp passes the 
    temp the equilibrium test cut off at.

                     __
                    /  `---.__
      _____________/          `----._____
    _/


*/


var filePrefix = "EqTest";
var samplesAvg = 20;             // TODO: Figure out right sample average

var eqRunning = false;
var cutoffSample = null;
var sampleQueue = [];
var queueSum = 0;
var avg_motorOn = true;
var last_avg = 0;


rcb.files.newLogFile({prefix: filePrefix});
readSensor();

function readSensor(){
    rcb.console.setVerbose(false);
    rcb.sensors.read(readDone, samplesAvg);
    rcb.console.setVerbose(true);
}

function readDone(result){
    rcb.console.setVerbose(false);
    rcb.files.newLogEntry(result,readSensor);
    rcb.console.setVerbose(true);

    if (eqRunning) {
        var dataPt = {};
        dataPt.time = result.time.displayValue;
        dataPt.temp = result.temp4LHE.displayValue;
        dataPt.esc = result.escA.displayValue;
        //rcb.console.print(JSON.stringify(dataPt));


        if (!windowAverage(dataPt)) {
            // Cut off the motor.
            rcb.console.print("Cut off motor.");
            rcb.output.pwm("escA", 1000);
            cutoffSample = result;
            eqRunning = false;
        }
    }

    if (cutoffSample) {
        // End test at cutoff temp
    }
}

rcb.console.print("Start Motor Spinning");
rcb.output.pwm("escA", 1220);
rcb.wait(startTest, 4);

function startTest() {
    rcb.output.ramp("escA", 1220, 2000, 10, eqTest);
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
    if (sampleQueue.length > 60 && deltaAvg < 1e-5 && sample.esc >= 2000) {
        avg_motorOn = false;
    }
    
    return avg_motorOn;
}
