# vis

This directory contains live visualization tools for real time data visualization of data streamed from the test stand.

The test stand has the ability to stream data in real time over UDP. Both methods use this functionality.

## Installation

1. Install the latest version of Python 3 from here: https://www.python.org/downloads/
2. Open a powershell window in the `vis` directory
3. The first time, install the packages using `pip install -r requirements.txt` (if `pip` isn't found, try `pip3`)
4. To run the tool, type `.\realTimeGraphs.bat` and press 'Enter'. 
5. In the output, there will be a link that looks like `http://localhost/bokeh_sockets`. Open that in your browser
6. Leave the Powershell window open as long as you want the visualizations to be available. (They will only work with automated scripts).

## Variation 1 (Recommended)

The first variation uses 3 sub programs to access and display the UDP stream. The main advantage is that it can support display to many clients at once. The components are:

- `udp reader`: The UDP reader: [udp_reader.py](https://github.com/Brojowski/uas/blob/master/vis/udp_reader.py)
- `re-broadcaster`: HTTP and socket server: [udp_rebroadcaster.py](https://github.com/Brojowski/uas/blob/master/vis/udp_rebroadcaster.py)
- `bokeh server`: The Visualization server: [bokeh_sockets.py](https://github.com/Brojowski/uas/blob/master/vis/bokeh_sockets.py)

The UDP reader is located in `udp reader` and the UDP server port has to match with RCBenchmark.  The `udp reader` then sends a request to the the `re-broadcaster` over HTTP as a json object. In order for the `udp reader` to keep up with the sample rate, the timeout is set very low, because we don' are about the response. The main purpose of the `re-broadcaster` is to take data points as json and send them to any clients that are subscribed by way of a websocket. The `bokeh server` attaches to the other end of that socket to receive the data points and provides website used to interact with them live.

To run this, install python 3 (tested with 3.7.4) and bokeh (tested with 1.3.4). Then just run all 3 programs at the same time. In Git Bash or a bash shell, this can be done using `./realTimeGraphs` or:
```bash
python udp_rebroadcaster.py &
python udp_reader.py &
bokeh serve bokeh_sockets.py
```

Then in the browser, the url should be similar to http://localhost:5006/bokeh_sockets

## Variation 2

This version produces the same output as Variation 1, however, since it is all contained in a single file, [bokeh_vis.py](https://github.com/Brojowski/uas/blob/master/vis/bokeh_vis.py), only one instance can be opened at once. This is due to only one instance being able to access the UDP stream at a time.
