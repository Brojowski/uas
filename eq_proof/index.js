let csv = require('csv-parser')
let fs = require('fs')
let math = require('mathjs')
let dataPoints = []

let window = 60

var t_max = -1
var T_max = -1
var max_motorOn = true

function maxForWindow(sample) 
{
    let T_sample = sample['Motor Temp']
    let t_sample = sample['Time']

    if (max_motorOn) {
        //console.log('Temp: ', T_sample, ' : ', T_max)
        //console.log('Time: ', t_sample, ' : ', t_max)
    }

    if (T_sample > T_max) 
    {
        T_max = T_sample
        t_max = t_sample
    }

    if (t_sample > (t_max + window)) 
    {
        // Cut the motor.
        max_motorOn = false
    }

    return max_motorOn
}

// SECTION: Average Temp Change

var sampleQueue = []
var queueSum = 0
var avg_motorOn = true
var last_avg = 0

function windowAverage(sample) {
    while (sampleQueue.length && sampleQueue[0].Time < (sample.Time - window)) {
        let removed = sampleQueue.shift()
        queueSum -= removed['Motor Temp']
    }

    sampleQueue.push(sample)
    queueSum += sample['Motor Temp']

    // Check for rounding errors.
    let temps = sampleQueue.map(it => it['Motor Temp'])
    let diff_sum = math.abs(queueSum - math.sum(temps))
    let diff_avg = math.abs((queueSum/sampleQueue.length) - math.mean(temps))
    if ( diff_sum > 1 || diff_avg > 1 ) {
        console.log(queueSum, math.sum(temps))
        console.log((queueSum/sampleQueue.length), math.mean(temps))
        throw "Not same maths"
    }

    let avg = queueSum / sampleQueue.length
    let deltaAvg = math.abs(avg - last_avg)
    last_avg = avg
    if (sampleQueue.length > 60 && deltaAvg < 1e-5 && sample['ESC (µs)'] >= 2000) {
        avg_motorOn = false
    }
    
    return avg_motorOn
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

    return max - min
}

function slopeEqInit() {
    sQueue = [];
    for (var i = 0; i < windowLength; i++) {
        sQueue.push( {"Motor Temp":0, "Time":0} );
    }

    mQueue = [];
    for (var i = 0; i < mSize; i++) {
        mQueue.push(0);
    }

    mSum = 0;
    seenSamples = 0;
}

function slopeEqOnSample(sample) {
    sQueue.shift()
    let removed = mQueue.shift()
    mSum -= removed

    sQueue.push(sample)
    let beginning = sQueue[mSize - 1]
    
    var m = (sample['Motor Temp'] - beginning['Motor Temp']) / (sample.Time - beginning.Time)
    if (m === Infinity) {
        m = Number.MAX_SAFE_INTEGER
    }

    mQueue.push(m)
    mSum += m
    seenSamples += 1;

    if (seenSamples < windowLength) {
        return false
    } else {
        return (math.abs(mSum) < mThresh) && (slopeEqRange() < tempRange)
    }
} 





// SECTION: Testing Code

function cutoffTests() {
    // Start Tests
    var last1 = true
    var last2 = true
    var last3 = true

    slopeEqInit()

    for (var i = 0; i < dataPoints.length; i++) 
    {
        if (last1 != maxForWindow(dataPoints[i])) {
            console.log('Max for window:', i)
            last1 = false
        }

        if (last2 != windowAverage(dataPoints[i])) {
            console.log('Delta Avg: ', i)
            last2 = false
        }
    }
}

function coolDownTests() {


}

let files = [
    'tiny-8.csv',
    'tiny-20.csv',
    'tiny-25.csv',
    'tiny-eq1.csv'
]
let j = 1

console.log(files[j])
fs.createReadStream(files[j])
    .pipe(csv({
        mapValues: ({ header, index, value }) => Number.parseFloat(value)
    }))
    .on('data', (data) => dataPoints.push(data))
    .on('end', () => 
    {
        //cutoffTests();

        // coolDownTests();
    })

slopeEqInit()
q=1
function test() {
    qMax = q + 60*40
    for (; q < qMax; q+=20) {
        if (slopeEqOnSample(dataPoints[q]))
            break;
        console.log(mSum)
    }
}