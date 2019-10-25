/*
    The KDE motors have issues where they will hit a thermal runaway condition.
    At a constant throttle setting, they will exponentially spike in 
    temperature. This seems to be able to be mitigated by running the motor at
     1200 PWM (~20%) which provides cooling for the motor.

    This script runs the motors (in thermal runaway) until they reach the max 
    temperature defined by the user. Then it cools them to the min temperature
    (also user defined) and lets them spike and measures the spike temperature.
*/

//======= User Defined Parameters =============================================

var motor = "KDE";
var sustainedPwm = 1600;
var coolPwm = 1200;
var maxHeatTemp = 130;
var coolToTemp = 100;

//====== Program =============================================================

/*
    Test segments: 
    - 0: Start up
    - 1: heat up
    - 2: cool down with fan
    - 3: spike
*/
var testSegments = 0;

var filePrefix = 'Runaway-' + motor + "-" + sustainedPwm;
var samplesAvg = 20;

var spikeMaxTemp = -1;

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

    switch (testSegments) {
        case 1:
            if (dataPt.temp > maxHeatTemp) {
                rcb.output.pwm('escA', coolPwm);
                testSegments++;
            }
            break;
        case 2:
            if (dataPt.temp < coolToTemp) {
                rcb.output.pwm('escA', 1000);
                testSegments++;
            }
            break;
        case 3:
            if (dataPt.temp > spikeMaxTemp) {
                spikeMaxTemp = dataPt.temp;
            }
            if (dataPt.temp < (spikeMaxTemp - 1)) {
                rcb.endScript();
            }
            break;
    }
}

function UDPInitialized(){
    rcb.console.print("Start Motor Spinning");
    rcb.output.pwm("escA", coolPwm);
    rcb.wait(startTest, 4);
}

function startTest() {
    rcb.console.print("Starting test");
    rcb.output.ramp("escA", coolPwm, sustainedPwm, 30, heatUp);
}

function heatUp() {
    rcb.console.print("Heat up started.");
    testSegments++;
}