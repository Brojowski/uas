mins = 1
hz = 40
window = mins * 60 * hz
eqPoint = 5026

windowSlope = function(T, t, start_index) {
  T_0 = T[start_index:(start_index+window)]
  T_bar = mean(T_0)
  t_0 = t[start_index:(start_index+window)]
  t_bar = mean(t_0)
  sum((t_0 - t_bar) * (T_0 - T_bar)) / sum((t_0 - t_bar)^2)
}
 
Log_2019_09_16_122316 <- read_csv("Log_2019-09-16_130945.csv")
Temp = Log_2019_09_16_122316$`4LHE Temp (ºF)`
time = Log_2019_09_16_122316$`Time (s)`

applyWindow = function(index) {
  windowSlope(Temp, time, index)
}
applyCor = function(index) {
  abs(cor(time[index:(index+window)], Temp[index:(index+window)]))
}
applyTemp = function(index) {
  Temp[index]
}
applyAvg = function(index) {
  abs(mean(Temp[index:(index+window)]) - mean(Temp[(index+1):(index+window+1)]))
}

seconds = 500
sampleOffset = 0
timings = (0:seconds) * hz + sampleOffset

#par(mfrow=c(2,1))
eqTemp = sapply(timings, applyTemp)
plot(timings, eqTemp, type = "l")
#eqSlopes = sapply(timings, applyWindow)
#plot(timings, eqSlopes, type = "l")
#eqCor = sapply(timings, applyCor)
#plot(timings, eqCor, type = "l")

eqDeltaAvg = sapply(timings, applyAvg)
plot(timings, eqDeltaAvg, type = "l", log = "y")
grid (NULL,NULL, lty = 6, col = "cornsilk2") 


# TODO something with variance

