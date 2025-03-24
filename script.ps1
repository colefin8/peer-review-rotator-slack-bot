# This script runs the index.js file using Node.js

# Get the directory of the current script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Define the relative path to the index.js file
$scriptPath = Join-Path $scriptDir "index.js"

# Check if Node.js is installed
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not added to the PATH."
    exit 1
}

# Run npm install to install dependencies
try {
    cd $scriptDir; npm i
} catch {
    Write-Error "Failed to install dependencies. Error: $_"
    exit 1
}

# Run the index.js file with Node.js
try {
    node $scriptPath
} catch {
    Write-Error "Failed to execute the script. Error: $_"
    exit 1
}