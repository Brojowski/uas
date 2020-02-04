/* //////////////// Description ////////////////

This script will perform a ramp up, followed by a plateau, and finish with a ramp down. It was designed to be repeatable, as to allow superposition of the resulting data. Everytime the script will execute, it will record the same number of samples, at the same timestamps. It is different from our other "sweep" script in the sense that the total number of recorded points can be fixed. Assuming the script parameters remain unchanged, the number of samples will always be the same. The samples timestamps, and their throttle values will be the same for each step aswell.

Written in collaboration with www.readytoflyquads.com

 ^ Motor Input
 |             ___maxVal   
 |            /   \                            
 |           /     \       
 | minVal___/       \___            
 |______0__1__2__3__4__5__________> Time

///////////// User defined script parameters //////////// */

// Throttle range
var minVal = 1050;  // Min. input value [700us, 2300us] 
var maxVal = 1600;  // Max. input value [700us, 2300us]

// Durations
var startTime = 5;      // The duration of the start portion (between point 0 and 1)
var rampUpTime = 10;     // The duration of the ramp up (between point 1 and 2)
var plateauTime = 600;   // The duration of the plateau (between point 2 and 3)
var rampDownTime = 10;   // The duration of the ramp down (between point 3 and 4)
var endTime = 2;        // The duration of the stop portion (between point 4 and 5)

// Number of samples
/* Note: total number of recorded samples will be the sum of all of these */
var startSamples = 5;     // Total samples recorded from 0 to 1 (including 0, excluding 1)
var rampUpSamples = 15;    // Total samples recorded from 1 to 2 (including 1, excluding 2)
var plateauSamples = 600;   // Total samples recorded from 2 to 3 (including 2, excluding 3)
var rampDownSamples = 15;  // Total samples recorded from 3 to 4 (including 3, excluding 4)
var endSamples = 4;       // Total samples recorded from 4 to 5 (including 4, excluding 5)

var filePrefix = "FRv1_TM15d"; 

///////////////// Beginning of the script //////////////////

// generate the list of points to sample
var points = [];
var totalTime = 0;
function makePoints(duration, samples, minTh, maxTh){
    for (var i=0; i<samples; i++){
        var percent = i/samples;
        
        // interpolate
        var throttle = minTh + i*(maxTh-minTh)/samples;
        var time = totalTime + i*duration/samples;
        var timems = time*1000;
        
        // add to list
        points.push({
            time: timems,
            throttle: throttle
        });
    }
    totalTime += duration;
}
makePoints(startTime, startSamples, minVal, minVal); //0 to 1 part
makePoints(rampUpTime, rampUpSamples, minVal, maxVal); //1 to 2 part
makePoints(plateauTime, plateauSamples, maxVal, maxVal); //2 to 3 part
makePoints(rampDownTime, rampDownSamples, maxVal, minVal); //3 to 4 part
makePoints(endTime, endSamples, minVal, minVal); //4 to 5 part

// start new log file
rcb.files.newLogFile({prefix: filePrefix});

// ESC initialization (assumes 4 seconds at minVal works, if your ESC is different, you may need to manually initialize your ESC prior to running the script)
rcb.console.print("Initializing ESC...");
rcb.output.pwm("escA",1000);
rcb.wait(read, 4);

// hide console debug info
rcb.console.setVerbose(false);

// start a read cycle
function read(){
    rcb.sensors.read(readDone, 1);
}

// execution loop
var startTime;
var lastTime;
var index = 0;
function readDone(result){
    var currTime = window.performance.now();
    if(index === 0){
        rcb.console.print("Saving in CSV:");
        startTime = currTime;
        savePoint(result);
    }else{
        if(points.length > index){
            // get the time at which the next step occurs
            var stepTime = points[index].time;
            var testTime = currTime - startTime;
            setThrottle(testTime, index);
            
            // check if point is ready
            if(stepTime <= testTime){
                
                //check if the next point is also ready (bad)
                var nextPoint = points[index+1];
                if(nextPoint){
                    if(nextPoint.time <= testTime){
                        rcb.console.error("Sampling rate too high! The GUI cannot keep up.");
                    }
                }
                
                savePoint(result);
            }else{
                read();
            }
        }else{
            //no more steps
            rcb.endScript();
        }
    }
}

// save a point
function savePoint(result){
    var time = 0.001 * points[index].time;
    var throttle = points[index].throttle;
    
    // comment these two lines if you accept some jitter in time and esc outputs
  //  result.time.displayValue = time; 
  //  result.esc.displayValue = throttle;
    
    // display what is happening on console
    var entry = index + 1;
    var line = "Line: " + entry;
    rcb.console.print("Line: " + entry + "   Throttle: " + throttle + "   Time:" + time);
    
    // save the point, and continue to next point
    rcb.files.newLogEntry(result,function(){
        index++;
        read();
    });
}

// calculates by interpolation the current throttle value
function setThrottle(testTime, index){
    var minTh = points[index-1].throttle;
    var maxTh = points[index].throttle;
    var minTime = points[index-1].time;
    var maxTime = points[index].time;
    var ratio = (testTime-minTime)/(maxTime-minTime);
    var throttle = minTh + ratio*(maxTh-minTh);
    rcb.output.pwm("escA",throttle);
}
