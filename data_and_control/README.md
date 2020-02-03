# data_and_control

 This folder contains raw data from all test runs, successful and unsuccessful as well as the RCBenchmark scripts used for testing.

 ## RCBenchmark Scripts

| Script            | Description |
|-------------------|-------------|
| KDE-Level.js      | Triggers a controlled thermal runaway with safety cutoffs for a short time.
| coolFromEq.js     | Equilibrium, Spike, Equilibrium, Equilibrium at low throttle, Spike. This test is to show that by cooling at a low throttle, we can lower the spike temperature.
| runawayCooling.js | Triggers thermal runaway, then cools the motor using a low throttle down to specified temperature, cuts it off and records the max spike temperature. This was used to show that thermal runaway can be safely controlled once it begins.
| spikeAndCool.js   | Equilibrium, Spike, cools to cutoff temp. Used for calculating f1(t) and f2(t), the functions defining the temperature spike for a motor.
| thermal_test.js   | Does a 3 Equilibrium/Spike test. Used to show that the equilibrium temperature of a motor is consistent.