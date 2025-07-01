#!/usr/bin/bash

echo "Kill all the parallel simulated J-boxes.  Leaves a simulated Optimiser alone."
echo "J-box processes before kill:"
ps -fu $USER

pkill -fx 'node.*device'

sleep 2;
echo "J-box processes after kill:"
ps -fu $USER

