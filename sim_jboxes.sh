#!/usr/bin/bash

count=$1
if [ $# != 1 ]; then
	echo "You must pass in the number of J-boxes to simulate to run this script, up to a maximum of 90";
	echo "Example usage ./sim_jboxes.sh 5" 
	exit 1;
fi

source ~/.nvm/nvm.sh
nvm use
nvm install

iteration=0
for key_file in ./keys/*.key; do
	if [ "$iteration" -lt "$count" ]; then
		iteration=$(( $iteration+1 ));
		echo "Iteration: $iteration";
		echo "Setting up simulated Jbox for $key_file";	
		jbox_id=$(echo "$key_file" | grep -Eio "device-[0-9]+")
		echo "Jbox ID $jbox_id"
		nohup node ./sim-jbox.js --id $jbox_id --key $key_file --url wss://staging-relay.juggle.energy --role device &
	fi
done
