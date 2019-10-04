## Equilibrium Proof

Our goal is to show that once our motor reaches the steady state, the temperature that it spikes to once turned off is constant. Preliminary testing seems to indicate this.

## Thermal Sensors

| Name      | Description                                                                   |
|-----------|-------------------------------------------------------------------------------|
| 4HLE      | Motor Temp Sensor, touching (or as close to ) the motor coils as possible.    |
| 319A      | ESC Temp Sensor, placed near the capacitors of the ESC                        |
| 66NA      | Ambient Temp Sensor, placed on top of the test stand                          |

## Tests

| File                                  | Motor             | Time (min)                | Notes                                                                         |
|---------------------------------------|-------------------|---------------------------|-------------------------------------------------------------------------------|
| tiny-20.csv                           | Tiny              | 20.37                     | Manual baseline for 20 minute motor running, No RPM                           |
| tiny-8.csv                            | Tiny              | 8.05                      | Manual baseline for 20 minute motor running, No RPM                           |
| tiny-25.csv                           | Tiny              | 25.31                     | Manual baseline for 20 minute motor running, Tape Blew Off                    |
| tiny-3cycle-fail.csv                  | Tiny              | 30.71                     | 3 cycle equilibrium test, failed because of lack of sustained power           |
| tiny-3cycle-success.csv               | Tiny              | 44.5                      | 3 cycle equilibrium test, batteries freshly charged                           |
| tiny-3cycle-70%-part1.csv             | Tiny              |                           | 3 cycle test at ~70% throttle                                                 |
| tiny-3cycle-70%-part2.csv             | Tiny              |                           | 3 cycle test at ~70% throttle                                                 |
| tiny-3cycle-100%-part3.csv            | Tiny              |                           | 3 cycle test at 100% throttle                                                 |
| tiny-3cycle-100%-part4.csv            | Tiny              |                           | 3 cycle test at 100% throttle                                                 |
| tiny-3cycle-70_100-combined.csv       | Tiny              |                           | all 4 parts of the cycle tests combined, (split because batteries swapped)    |
