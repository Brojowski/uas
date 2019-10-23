import csv
import os

def floatOrNeg1(f):
    try:
        return float(f)
    except:
        return -1

class DataPoint:
    def __init__(self, time, pwm, voltage, current, rpm, power, escTemp, motorTemp, ambTemp='-1.0'):
        self.time = floatOrNeg1(time)
        self.pwm = floatOrNeg1(pwm)
        self.voltage = floatOrNeg1(voltage)
        self.current = floatOrNeg1(current)
        self.rpm = floatOrNeg1(rpm)
        self.power = floatOrNeg1(power)
        self.escTemp = floatOrNeg1(escTemp)
        self.ambTemp = floatOrNeg1(ambTemp)
        self.motorTemp = floatOrNeg1(motorTemp)
        
    def __repr__(self):
        return self.__str__()
    
    def __str__(self):
        return  '< ' + str(self.time) + ', ' + str(self.pwm) + ', ' + str(self.voltage) + ', ' + str(self.current) + ', ' + str(self.rpm) + ', ' + str(self.power) + ', ' + str(self.escTemp) + ', ' + str(self.motorTemp) + ', ' + str(self.ambTemp)  +  ' >'
    
def dataPointFrom(row):
    if len(row) > 17:
        # Data since the ambient temp sensor
        return DataPoint(row[0], row[1], row[5], row[6], row[7], row[8], row[13], row[15], row[14])
    else:
        # Data before the ambient temp sensor
        return DataPoint(row[0], row[1], row[5], row[6], row[7], row[8], row[13], row[14])
        
# For a CSV file, get all the rows
def getRows(folder, dataFile):
    #print(dataFile)
    with open(folder + '/' + dataFile) as rawData:
        data = csv.reader(rawData)
        next(data) # skip the header line
        return [dataPointFrom(row) for row in data]

class Run:
    def __init__(self, file, data):
        self.file = file
        self.data = data
        self.props = dict()

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return self.file + '\n' + str(self.data) + '\n' + str(self.props)

def runsFromFolder(folder):
    # Get all the CSV files
    dataFiles = list(filter(lambda x: 'csv' in x, os.listdir(folder)))
    return list(map(lambda f: Run(file=f, data=getRows(folder, f)), dataFiles))

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