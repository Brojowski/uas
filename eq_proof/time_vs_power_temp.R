data = read.csv("tiny-3cycle-success.csv")

data

par(mfrow=c(2, 1))
plot(data$Time, data$Electrical.Power..W.)
plot(data$Time, data$Motor.Temp)