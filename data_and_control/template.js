/*
    template.js

    This file gives a good starting point for developing new RCBenchmark scripts.
*/

//======= User Defined Parameters =============================================

var testName            = "HeadBaseline"
var motorName           = "KDE5215";
var testPwm             = 2000;

//====== Script Specification =================================================

/**
 * This function get called once the stand is set up and read to 
 * start the new test.
 */
function startTest() {

}

/**
 * This function gets called every time a data point is read.
 * Use it to control the flow of the program.
 * 
 * @param dataPt the current state of the stand
 *      - time: the time of the stand
 *      - temp: the temperature of the motor (probe on coils)
 *      - ambTemp: the ambient temperature (probe on top of stand)
 *      - escTemp: the electronic speed controller temperature (probe on ESC)
 *      - pwm: the control signal 
 *      - voltage: the voltage going to the motor
 *      - current: the current through the motor
 *      - power: the power through the motor
 *      - rpm: the number of rotations per minute of the motor
 */
function onDataPoint(dataPt) {

}

//====== Program Base =========================================================

// Minimum control signal level. Motor shouldn't spin.
var offPwm = 1000;

// The stand averages samples to smooth the reading
// from the sensors. The sample rate is ~40 times per 
// second. 
// The default (20) is about 2 data points per second.
var samplesAvg = 20;

// Create a log file for this test.
var filePrefix = testName + "-" + motorName + "-" + testPwm;
rcb.files.newLogFile({prefix: filePrefix});

// Sets up a UDP stream for external programs to access
// the current state of the stand for visualization, etc.
var receive_port = 55047; 
var send_ip = "127.0.0.1"; 
var send_port = 64126; 
rcb.udp.init(receive_port, send_ip, send_port, UDPInitialized);

// Start polling the stand for data.
readSensor();
function readSensor(){
    rcb.console.setVerbose(false);
    rcb.sensors.read(readDone, samplesAvg);
    rcb.console.setVerbose(true);
}

// A new data point was received by the system.
// Send it over UDP and pass it for the programmer
// to handle.
function readDone(result){ 

    // Save the data point in the log file.
    rcb.console.setVerbose(false);
    rcb.files.newLogEntry(result, readSensor);
    rcb.console.setVerbose(true);

    // Extract the useful info from the data point.
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
    
    // Send the data point over UDP stream
    var buffer = rcb.udp.str2ab(JSON.stringify(dataPt));
    rcb.udp.send(buffer);

    // Allow the programmer to control the data.
    onDataPoint(dataPt);
}

// The UDP stream is set up, ramp up to start the test.
function UDPInitialized(){
    rcb.console.print("Start Motor Spinning");
    rcb.output.pwm("escA", offPwm);

    // Have user start the test
    startTest();
}