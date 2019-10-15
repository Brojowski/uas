import socket
import sys
import json

import pandas as pd
import numpy as np
import holoviews as hv
from holoviews import opts
hv.extension('bokeh')

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Bind the socket to the port
server_address = ('localhost', 64126)
print('starting up on %s port %s' % server_address)
sock.bind(server_address)

pts = []
while True:
    data, address = sock.recvfrom(4096)

    if data != None:
        sample = json.JSONDecoder().decode(data.decode('ascii'))

        pts.append( (sample['time'], sample['temp']) )

        hv.Curve(pts)


        

