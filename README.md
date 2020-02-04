# KSU UAS Test Stand Data 2019-2020

This repo contains data, test scripts, visualizations and analysis from the *Unmanned VTOL Propulsion Research UAS Static Thrust Bench* during the 2019-2020 academic year.

## Goals

- Show electric motors have a thermal equilibrium condition.
- Investigate and mitigate thermal runaway
- Determine the functions `f1(t)` and `f2(t)` that define motor temperature spikes. 

```
x: time
y: temperature

                    ,--._
                   /     ``-._
                  /           ``-._
    ,.-----------'                 ``-._
   /                 
_,/              ^   ^                 ^
                 1   2                 3

    - Temp 1 -> 2 is f1(t)
    - Temp 2 -> 3 is f2(t)

```



## Repo Structure

| Folder/File                       | Description |
|-----------------------------------|-------------|
| AIAA_DBF/                         | Motor testing for AIAA Design Build Fly
| cooling_slopes/                   | Data for determining `f1(t)` and `f2(t)`. See `SpikeSlopeAnalysis.ipynb` for more
| data_2018_2019                    | Last year's test data.
| data_and_control/                 | Contains RCBenchmark scripts and unfiltered/sorted data.
| eq_proof/                         | Discussion of motor equilibrium.
| kde_level_testing/                | Data for thermal runaway. See `KDE-Level.ipynb` for analysis
| vis/                              | Interactive real-time visualizations that extend RCBenchmarks monitoring capability
| AllRunsTempPlots.ipynb            | Display all of the time/temp plots in the data_and_control folder
| analysis_tools.py                 | Structures and tools useful to all analysis
| KDE-Levels.ipynb                  | Analysis of thermal runaway. See `kde_level_testing` for more info.
| LastYearDataHandling.ipynb        | 
| RunawayCooling.ipynb              |
| ScratchPad.ipynb                  |
| SlopeEqCondition.ipynb            | 
| SpikeAnalysis.ipynb               |
| SpikeCoolingAnalysis.ipynb        |
| SpikeSlopeCharacterization.ipynb  | Analysis of `f1(t)` and `f2(t)`. See file and `cooling_slopes` for more.
| TempTrendVariations.ipynb         |