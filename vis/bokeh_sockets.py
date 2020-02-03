from functools import partial
from random import random
from threading import Thread
import time

from bokeh.models import ColumnDataSource
from bokeh.plotting import curdoc, figure

from tornado import gen

import socket
import sys
import json
import matplotlib.pyplot as plt

import socketio

# this must only be modified from a Bokeh session callback
source = ColumnDataSource(data=
dict(
    time=[],   
    temp=[],   
    ambTemp=[],
    escTemp=[],
    pwm=[],    
    voltage=[],
    current=[],
    power=[],  
    rpm=[],
    windowStartTime=[],
    windowStartTemp=[]
))



# This is important! Save curdoc() to make sure all threads
# see the same document.
doc = curdoc()

@gen.coroutine
def update(
    time,   
    temp,   
    ambTemp,
    escTemp,
    pwm,
    voltage,
    current,
    power,
    rpm,
    windowStartTime,
    windowStartTemp):
    source.stream(dict(
        time=[time],   
        temp=[temp],
        ambTemp=[ambTemp],
        escTemp=[escTemp],
        pwm=[pwm],
        voltage=[voltage],
        current=[current],
        power=[power],
        rpm=[rpm],
        windowStartTime=[windowStartTime],
        windowStartTemp=[windowStartTemp]
    ))

def blocking_task():
    sio = socketio.Client()

    @sio.on('dataPoint')
    def fdsa(sample):
        # but update the document from callback
        doc.add_next_tick_callback(partial(update,
                                                time=sample['time'],   
                                                temp=sample['temp'],   
                                                ambTemp=sample['ambTemp'],
                                                escTemp=sample['escTemp'],
                                                pwm=sample['pwm'],
                                                voltage=sample['voltage'],
                                                current=sample['current'],
                                                power=sample['power'],
                                                rpm=sample['rpm'],
                                                windowStartTime=sample['windowStartTime'],
                                                windowStartTemp=sample['windowStartTemp']
                                                ))
    
    sio.connect('http://localhost:5000')

p1 = figure(x_range=[0, 1000], y_range=[70,120], title="Temperatures (F)")
p1.circle(x='time',y='ambTemp',source=source, color='grey')
p1.circle(x='time',y='escTemp',source=source, color='yellow')
p1.circle(x='time',y='temp',source=source)
p1.circle(x='windowStartTime',y='windowStartTemp',source=source, color='lightblue')

p3 = figure(x_range=p1.x_range, y_range=[750, 2250], title="Throttle (PWM, 1000-2000)")
p3.circle(x='time',y='pwm',source=source)

p4 = figure(x_range=p1.x_range, y_range=[0,70], title="Voltage (V)")
p4.circle(x='time',y='voltage',source=source)

p5 = figure(x_range=p1.x_range, y_range=[0,90], title="Current (A)")
p5.circle(x='time',y='current',source=source)

p6 = figure(x_range=p1.x_range, y_range=[0,4000], title="Power (W)")
p6.circle(x='time',y='power',source=source)

p7 = figure(x_range=p1.x_range, y_range=[0,10000], title="Rotations Per Minute (RPM`)")
p7.circle(x='time',y='rpm',source=source)

doc.add_root(p1)
doc.add_root(p3)
doc.add_root(p6)
doc.add_root(p4)
doc.add_root(p5)
doc.add_root(p7)

thread = Thread(target=blocking_task)
thread.start()