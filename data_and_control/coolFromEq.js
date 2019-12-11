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
var sustainedPwm = 1600;
var lowThrottlePwm = 1200;

//=========== Program =========================================================

var filePrefix = "EqCool-" + motor + '-' + sustainedPwm;
var samplesAvg = 20;
var testSection = 0;

var cutoffSample = null;

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
            if (slopeEqOnSample(dataPt)) {
                // Cut off the motor.
                rcb.console.print("Cut off motor.");
                rcb.output.pwm("escA", 1000);
                cutoffSample = dataPt;
                testSection++;
            }
            rcb.console.print(mSum);
            break;
        
        case 2: 
            if (maxSpikeTemp < dataPt.temp) {
                maxSpikeTemp = dataPt.temp;
            }
            if ((maxSpikeTemp - 1) > dataPt.temp) {
                startTest();
                maxSpikeTemp = -1;
                slopeEqInit();
                testSection++;
            }
            break;

        // Case 3. ramp up to full power again
        
        case 4:
            if (slopeEqOnSample(dataPt)) {
                // Cut off the motor.
                rcb.console.print("Cut to low power.");
                rcb.output.pwm("escA", lowThrottlePwm);
                cutoffSample = dataPt;

                cutoffSample = null;

                testSection++;
                slopeEqInit();
            }
            rcb.console.print(mSum);
            break;

        case 5:
            if (slopeEqOnSample(dataPt)) {
                // Cut off the motor.
                rcb.console.print("Cut off motor.");
                rcb.output.pwm("escA", 1000);
                cutoffSample = dataPt;
                testSection++;
            }
            rcb.console.print(mSum);
            break;

        case 6:
            if (maxSpikeTemp < dataPt.temp) {
                maxSpikeTemp = dataPt.temp;
            }
            if ((maxSpikeTemp - 1) > dataPt.temp) {
                end();
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
    slopeEqInit();
    rcb.output.ramp("escA", lowThrottlePwm, sustainedPwm, 10, eqTest);
    cutoffSample = null;
}

function eqTest() {
    testSection++;
}

// SECTION: Slope Equilibrium Definition

let windowLength = 60 * 2;

let mThresh = 1/windowLength;
let tempRange = 1;
let mSize = math.floor( windowLength/2 );

var sQueue = [];
var mQueue = [];
var mSum = 0;
var seenSamples = 0;

function slopeEqRange() {
    var min = 1000;
    var max = -1;

    for (var i = 0; i < windowLength; i++) {
        let temp = sQueue[i]['Motor Temp'];
        if (temp < min) {
            min = temp;
        } else if (temp > max) {
            max = temp;
        }
    }

    return max - min;
}

function slopeEqInit() {
    sQueue = [];
    for (var i = 0; i < windowLength; i++) {
        sQueue.push( { temp:0, time:0 } );
    }

    mQueue = [];
    for (i = 0; i < mSize; i++) {
        mQueue.push(0);
    }

    mSum = 0;
    seenSamples = 0;
}

function slopeEqOnSample(sample) {
    sQueue.shift();
    let removed = mQueue.shift();
    mSum -= removed;

    sQueue.push(sample);
    let beginning = sQueue[mSize - 1];
    
    var m = (sample.temp - beginning.temp) / (sample.time - beginning.time);
    if (m === Infinity) {
        m = Number.MAX_SAFE_INTEGER;
    }

    mQueue.push(m);
    mSum += m;
    seenSamples += 1;

    if (seenSamples < windowLength) {
        return false;
    } else {
        return (math.abs(mSum) < mThresh) && (slopeEqRange() < tempRange);
    }
} 
