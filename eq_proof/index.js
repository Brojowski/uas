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
    if (deltaAvg < 1e-5 && sample['ESC (µs)'] >= 2000) {
        avg_motorOn = false
    }
    
    return avg_motorOn
}

let files = [
    'tiny-8.csv',
    'tiny-20.csv',
    'tiny-25.csv',
    'tiny-eq1.csv'
]
let j = 3

console.log(files[j])
fs.createReadStream(files[j])
    .pipe(csv({
        mapValues: ({ header, index, value }) => Number.parseFloat(value)
    }))
    .on('data', (data) => dataPoints.push(data))
    .on('end', () => 
    {
        // Start Tests
        var last1 = true
        var last2 = true
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

        
    })