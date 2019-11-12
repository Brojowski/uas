mins = 1
hz = 2
window = mins * 60 * hz

windowSlope = function(T, t, start_index) {
  T_0 = T[start_index:(start_index+window)]
  T_bar = mean(T_0)
  t_0 = t[start_index:(start_index+window)]
  t_bar = mean(t_0)
  sum((t_0 - t_bar) * (T_0 - T_bar)) / sum((t_0 - t_bar)^2)
}
applyWindow = function(index, time, Temp) {
  windowSlope(Temp, time, index)
}
applyCor = function(index, time, Temp) {
  abs(cor(time[index:(index+window)], Temp[index:(index+window)]))
}
applyTemp = function(index, Temp) {
  Temp[index]
}
applyAvg = function(index, time, Temp) {
  abs(mean(Temp[index:(index+window)]) - mean(Temp[(index+1):(index+window+1)]))
}
applyMax = function(index, time, Temp) {
  max(Temp[index:(index+window)])
}
applyStdev = function(index, time, Temp) {
  sd(Temp[index:(index+window)])
}

applyLine = function(index, time, Temp) {
  abs(line(time[index:(index+window)], Temp[index:(index+window)])$coefficients[2])
}
 
plotDataSet = function(Temp, time, t_op_start=1, t_off=(length(Temp)-window)){
  timings = seq(t_op_start, t_off)
  
  # Graphs
  #par(mfrow=c(3, 1))
  eqTemp = sapply(timings, function(index) { applyTemp(index, Temp) })
  plot(timings, eqTemp, type = "l")
  grid (NULL,NULL, lty = 6, col = "cornsilk2") 
  
  eqLine = sapply(timings, function (index) { applyLine(index, time, Temp)})
  lines(timings, (eqLine*20) + 100, type='l', ylim=range(0, .02))
  
  #eqDeltaAvg = sapply(timings, function(index) { applyAvg(index, time, Temp) })
  #plot(timings, eqDeltaAvg, type = "l", log = "y")
  #grid (NULL,NULL, lty = 6, col = "cornsilk2") 
  
  eqStdev = sapply(timings, function(index) { applyStdev(index, time, Temp)})
  lines(timings, (2*eqStdev) + 98, type='l', ylim = range(0, 2))
  grid(NULL, NULL, lty = 6, col = 'cornsilk2')
  
  
  #eqMax =  sapply(timings, function(index) { applyMax(index, time, Temp) })
  #plot(timings, eqMax, type = "l")
  #grid (NULL,NULL, lty = 6, col = "cornsilk2") 
  
  #eqSlopes = sapply(timings, function(index) { applyWindow(index, time, Temp) })
  #plot(timings, eqSlopes, type = "l")
  #eqCor = sapply(timings, function(index) { applyCor(index, time, Temp) })
  #plot(timings, eqCor, type = "l")
}

#plotDataSet(read.csv("tiny-8.csv"), 1361, 21300)
#plotDataSet(read.csv("tiny-20.csv"), 3500, 50700)
#plotDataSet(read.csv("tiny-25.csv"), 3300, 61700)
#plotDataSet(read.csv("tiny-eq1.csv"), 30, 1000)
#plotDataSet(read.csv("tiny-30.csv"), 200, 2707)
#plotDataSet(read.csv(("tiny-3cycle_70.csv")))

smooth = function(time, temp, size) {
  timings = 1:(length(temp))
  
  l = list()
  l$temps = sapply(timings, function(start) { 
      mean(temp[start:(start+size)])
  })
  l$times = time[timings]
  l
}
