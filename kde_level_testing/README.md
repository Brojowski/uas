# kde_level_testing

This folder contains data about thermal testing a KDE Direct 7215XF motor. In the lab, we have had 3 of them start smoking when run within power specifications. 

https://www.kdedirect.com/products/kde7215xf-135

The condition, called `thermal runaway` causes the motor to heat up exponentially even in low power conditions (~1000W, well below the rated max of 4405W). If thermal runaway is not caught early, the motor will begin to smoke and seems to be burning the protective coating on the wires.

This set of tests aims to subject the motor to controlled thermal runaway and record the result. Test files are stored as 
```
<Prefix>-<Motor>-<PWM>_<Date>.csv
```

| Variations    | Description |
|---------------|-------------|
| Level         | The initial round of testing, motor smoked at 1800
| PostBurnLevel | After smoking, re-ran the initial tests to determine change in performance
| Start100Level | Starts the test at 100 degrees F by cooling from thermal run away 
| (Cooled)      | Ran with TPI Industrial fan blowing to increase airflow
| (Spaced)      | Added 50mm of space between motor and backplate 

For analysis see [KDE-Levels.ipynb](https://github.com/Brojowski/uas/blob/master/KDE-Levels.ipynb)