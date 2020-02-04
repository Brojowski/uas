function [C_T] = Thrust_Coefficient(T,p,area,rot_speed,radius)
%UNTITLED3 Summary of this function goes here
%   Detailed explanation goes here
C_T = T ./ (p .* area * (rot_speed * radius).^2);
end

