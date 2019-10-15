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

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Bind the socket to the port
server_address = ('localhost', 64126)
print('starting up on %s port %s' % server_address)
sock.bind(server_address)


# this must only be modified from a Bokeh session callback
source = ColumnDataSource(data=dict(x=[-1], y=[75]))

# This is important! Save curdoc() to make sure all threads
# see the same document.
doc = curdoc()

@gen.coroutine
def update(x, y):
    source.stream(dict(x=[x], y=[y]))

def blocking_task():
    while True:
        data, address = sock.recvfrom(4096)

        if data != None:
            sample = json.JSONDecoder().decode(data.decode('ascii'))
            print(sample)

            # but update the document from callback
            doc.add_next_tick_callback(partial(update, x=sample['time'], y=sample['temp']))

p = figure(x_range=[0, 60], y_range=[70,90])
l = p.circle(x='x', y='y', source=source)

doc.add_root(p)

thread = Thread(target=blocking_task)
thread.start()