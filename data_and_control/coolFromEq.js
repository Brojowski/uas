/*

    This heats the motor to equilibrium, lets it spike once to see the max temp.
    Then it brings the motor back to equilibrium before turning it down to min 
    throttle until it levels off. Then it cuts off to measure the spike.
    
    Throttle:
      ____________     _____________
     |            |   |             |
     |            |   |             |___________
    _|            |___|                         |_____________

    Temp:
                    __
                   /  \                           __
       ___________/    \_____________            /  ``--.._
      /                              \__________/          ``--.._
    _/

    Parts:
      1           2   3            3 4          5

    0. Ramp up to full power
    1. Equilibrium
    2. Spike to max temp
    3. Ramp back up to full power
    4. Equilibrium
    5. Low throttle ~10%
    6. Spike 
*/

//=========== User Variables ==================================================

var motor = "KDE";
var sustainedPwm = 1400;
var lowThrottlePwm = 1200;

//=========== Program =========================================================

var filePrefix = "EqCool-" + motor + '-' + sustainedPwm;
var samplesAvg = 20;
var testSection = 3;

var eqRunning = false;
var cutoffSample = null;
var sampleQueue = [];
var queueSum = 0;
var avg_motorOn = true;
var last_avg = 0;
var number_of_tests = 3;
var currentRunNum = 0;
var cutoffTime = 120;

var maxSpikeTemp = -1;

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

    rcb.console.print(testSection);
    switch (testSection) {
        // Case 0. ramp up to full power to start

        case 1:
            if (eqRunning) {
                if (!windowAverage(dataPt)) {
                    // Cut off the motor.
                    rcb.console.print("Cut off motor.");
                    rcb.output.pwm("escA", 1000);
                    cutoffSample = dataPt;
                    eqRunning = false;
                    testSection++;
                }
            }
            break;
        
        case 2: 
            if (maxSpikeTemp < dataPt.temp) {
                maxSpikeTemp = dataPt.temp;
            }
            if ((maxSpikeTemp - 1) > dataPt.temp) {
                startTest();
                maxSpikeTemp = -1;
                testSection++;
            }
            break;

        // Case 3. ramp up to full power again
        
        case 4:
            if (eqRunning) {
                if (!windowAverage(dataPt)) {
                    // Cut off the motor.
                    rcb.console.print("Cut to low power.");
                    rcb.output.pwm("escA", lowThrottlePwm);
                    cutoffSample = dataPt;

                    eqRunning = false;
                    sampleQueue = [];
                    queueSum = 0;
                    avg_motorOn = true;
                    eqRunning = false;
                    cutoffSample = null;
                    last_avg = 0;

                    testSection++;
                }
            }
            break;

        case 5:
            if (!windowAverage(dataPt)) {
                // Cut off the motor.
                rcb.console.print("Cut off motor.");
                rcb.output.pwm("escA", 1000);
                cutoffSample = dataPt;
                testSection++;
            }
            break;

        case 6:
            if (cutoffSample !== null && cutoffSample.temp > dataPt.temp) {
                rcb.wait(end, 60);
            }
            break;
    }
}

function end() {
    rcb.endScript();
}

function UDPInitialized(){
    rcb.console.print("Start Motor Spinning");
    rcb.output.pwm("escA", lowThrottlePwm);
    rcb.wait(startTest, 4);
}

function startTest() {
    currentRunNum++;
    rcb.console.print("Starting test #", currentRunNum);
    rcb.output.ramp("escA", lowThrottlePwm, sustainedPwm, 10, eqTest);
    sampleQueue = [];
    queueSum = 0;
    avg_motorOn = true;
    eqRunning = false;
    cutoffSample = null;
    last_avg = 0;
}

function eqTest() {
    eqRunning = true;
    testSection++;
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
