function [C_Q] = Torque_Coefficient(Q, p,area,rot_speed,radius)
%UNTITLED Summary of this function goes here
%   Detailed explanation goes here
C_Q = Q ./ (p .* area .* (rot_speed .* radius).^(2) .* radius);


end

