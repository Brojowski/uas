function [C_P] = Power_Coefficient(P_out,p,area,rot_speed,radius)
%UNTITLED2 Summary of this function goes here
%   Detailed explanation goes here
C_P = P_out ./ (p .* area .* (rot_speed .* radius).^3);
end

