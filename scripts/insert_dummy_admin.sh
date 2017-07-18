#!/bin/bash

if [ -z "$1"]; then
	echo "Please provide valid argument"
	elif [ "$1" ne "local" || "$1" ne "remote"]; then
	echo "Accepted arguments value are: local and remote"
	else
		mongo create_dummy_admin_$1.js
fi
