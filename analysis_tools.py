import csv
import os
import re

def floatOrNeg1(f):
    try:
        return float(f)
    except:
        return -1

class DataPoint:
    def __init__(self, time, pwm, torque, thrust, voltage, current, rpm, power, mechPower, motorEff, propEff, efficiency, escTemp, motorTemp, ambTemp='-1.0'):
        self.time = floatOrNeg1(time)
        self.pwm = floatOrNeg1(pwm)
        self.voltage = floatOrNeg1(voltage)
        self.current = floatOrNeg1(current)
        self.rpm = floatOrNeg1(rpm)
        self.power = floatOrNeg1(power)
        self.escTemp = floatOrNeg1(escTemp)
        self.ambTemp = floatOrNeg1(ambTemp)
        self.motorTemp = floatOrNeg1(motorTemp)
        self.mechPower = floatOrNeg1(mechPower)
        self.torque = floatOrNeg1(torque)
        self.thrust = floatOrNeg1(thrust)
        self.motorEff = floatOrNeg1(motorEff)
        self.propEff = floatOrNeg1(propEff)
        self.efficiency = floatOrNeg1(efficiency)
        
    def __repr__(self):
        return self.__str__()
    
    def __str__(self):
        return  '< ' + str(self.time) + ', ' + str(self.pwm) + ', ' + str(self.voltage) + ', ' + str(self.current) + ', ' + str(self.rpm) + ', ' + str(self.power) + ', ' + str(self.escTemp) + ', ' + str(self.motorTemp) + ', ' + str(self.ambTemp)  +  ' >'
    
def dataPointFrom(row):
    if len(row) > 17:
        # Data since the ambient temp sensor
        return DataPoint(row[0], row[1], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[15], row[14])
    else:
        # Data before the ambient temp sensor
        return DataPoint(row[0], row[1], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14])
    
    
    
# For a CSV file, get all the rows
def getRows(folder, dataFile):
    #print(dataFile)
    with open(folder + '/' + dataFile) as rawData:
        data = csv.reader(rawData)
        next(data) # skip the header line
        return [dataPointFrom(row) for row in data]

    
    
class Run:
    def __init__(self, file, data, details=None):
        self.file = file
        self.data = data
        self.props = dict()
        self.details = details

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return self.file + '\n' + str(self.data) + '\n' + str(self.props)

    
    
    
def runsFromFolder(folder, filterText=''):
    # Get all the CSV files
    dataFiles = list(filter(lambda x: filterText in x, filter(lambda x: 'csv' in x, os.listdir(folder))))
    return list(map(lambda f: Run(file=f, data=getRows(folder, f), details=runDetails(f)), dataFiles))



def parseRun(folder, file):
    return Run(file, data=getRows(folder, file))

# returns: [ index of last point with throttle at full power before cutoff ]
def findSpikes(run, eqThrottle=[2000, 1700], minThrottle=1000):
    spikeIndexes = []
    for i in range(1, len(run.data)-2):
        change = run.data[i:i+2]
        if (change[0].pwm in eqThrottle and change[1].pwm == minThrottle):
            spikeIndexes.append(i)
    
    return spikeIndexes


def mapRunToColor(run):
    return mapPwmToColor(int(re.findall('KDE-([0-9]{4})', run.file)[0]))

def mapPwmToColor(pwm):
    colors = { 1200:'purple', 1300:'blue', 1400:'green', 1500:'grey', 1600:'yellow', 1700: 'orange',1800:'red', 1900:'brown', 2000:'black'}
    return colors[pwm]




class TestDetails:
    def __init__(self, testName, motor, testPwm, testDate, startTime):
        self.testName = testName
        self.motor = motor
        try:
            self.testPwm = testPwm
        except:
            print()
        self.testDate = testDate
        self.startTime = startTime
        
    def __str__(self):
        return "<" + self.testName + " " + self.motor + " " + str(self.testPwm) + " " + self.testDate + " " + self.startTime + ">"
    
    def __repr__(self):
        return self.__str__()

    
    
    
def runDetails(filename):
    match = re.search("([^-]*)-([^-]*)-([^-]*)\_([^_\.]*)\_([^_\.]*)\.csv", filename)
    if match != None:
        return TestDetails(
            match[1],
            match[2],
            match[3],
            match[4],
            match[5]
        )
    else:
        return None