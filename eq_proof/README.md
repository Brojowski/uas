## Equilibrium Proof

Our goal is to show that once our motor reaches the steady state, the temperature that it spikes to once turned off is constant. Preliminary testing seems to indicate this.

## Tests

| File                      | Motor             | Time (min)                | Notes                                                                     |
|---------------------------|-------------------|---------------------------|---------------------------------------------------------------------------|
| tiny-20.csv               | Tiny              | 20.37                     | Manual baseline for 20 minute motor running, No RPM                       |
| tiny-8.csv                | Tiny              | 8.05                      | Manual baseline for 20 minute motor running, No RPM                       |
| tiny-25.csv               | Tiny              | 25.31                     | Manual baseline for 20 minute motor running, Tape Blew Off                |
| tiny-3cycle-fail.csv      | Tiny              | 30.71                     | 3 cycle equilibrium test, failed because of lack of sustained power       |
| tiny-3cycle-success.csv   | Tiny              | 44.5                      | 3 cycle equilibrium test, batteries freshly charged                       |