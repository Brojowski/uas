/*
See ../KDECustomHead.ipynb for details.

Throttle:
 .----.
 |    |   .----.   
 |    |   |    |   .----.
 |    |   |    |   |    |   .----.
_|    |___|    |___|    |___|    |___
*/

//======= User Defined Parameters =============================================

var motor               = "KDE5215";
var safetyCutoffTemp    = 115;
var startTestTemp       = 95;
var heatUpPwm           = 1400;
var maxPwm              = 2000;
var minPwm              = 1200;
var pwmStep             = -100;
var heatUpTime          = 5 * 60;

//====== Program =============================================================

/*
    Test segments:
    - 0: Heat up at `heatUpPwm`
    - 1: While temp < `startTestTemp`, keep heating
    - 2: Loop tests.
*/
var testSegments = 0;

var offPwm = 1000;
var testPwm = maxPwm;
var heating = false;

var filePrefix = "HeadBaseline-" + motor + "-" + testPwm;
var samplesAvg = 20;

var spikeMaxTemp = -1;

var testStartTime = -1;

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

    rcb.console.print("temp: " + dataPt.temp + "    section: " + testSegments);

    switch (testSegments) {
        case 1:
            if (dataPt.temp > startTestTemp) {
                rcb.output.pwm('escA', offPwm);
                testSegments++;
            }
            break;
        case 2:
            // This checks if the temp has reached
            if (heating && (dataPt.temp > safetyCutoffTemp || dataPt.time > (testStartTime + heatUpTime))) {
                if (dataPt.temp > safetyCutoffTemp) {
                    rcb.console.print("Temp cutoff");
                } else if (dataPt.time > (testStartTime + heatUpTime)) {
                    rcb.console.print("Time cutoff");
                }
                
                rcb.output.pwm('escA', offPwm);
                heating = false;
                
                // += so that stepping can be done either way.
                testPwm += pwmStep;
            }

            // This check if the temp is low enough to start the next test.
            if (!heating && dataPt.temp < startTestTemp) {
                // If this test is below the minPwm, exit, the test is done
                if (testPwm < minPwm) {
                    rcb.endScript();
                }
                
                rcb.console.print("Starting test @ " + testPwm);
                rcb.output.pwm('escA', testPwm);
                heating = true;
                testStartTime = dataPt.time;
            }

            break;
    }
}

function UDPInitialized(){
    rcb.console.print("Start Motor Spinning");
    rcb.output.pwm("escA", minPwm);
    rcb.output.ramp("escA", offPwm, minPwm, 4, startTest);
}

function startTest() {
    rcb.console.print("Starting test");
    rcb.output.ramp("escA", minPwm, heatUpPwm, 3, heatUp);
}

function heatUp() {
    rcb.console.print("Heat up started.");
    testSegments++;
}