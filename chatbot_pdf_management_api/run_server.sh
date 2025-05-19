#!/bin/bash
# this script is used to start the serve   
# code by jeerasak ss4
# @date 
# Exit immediately if a command exits with a non-zero status
set -e

# Function to display usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -h, --help      Display this help message"
}

# Check for help options
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown parameter passed: $1"; usage; exit 1 ;;
    esac
    shift
done

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Setup vector db
echo "---------------- Setup vector db ---------------------"
python3 setup_vecterdb.py

# Start PDF management API
echo "---------------- Start PDF management API ---------------------"

# start PDF management API server 
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload 
echo "--------------------------------------------------------------------"

