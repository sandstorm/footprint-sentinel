#!/bin/bash
############################## DEV_SCRIPT_MARKER ##############################
# This script is used to document and run recurring tasks in development.     #
#                                                                             #
# You can run your tasks using the script `./dev some-task`.                  #
# You can install the Sandstorm Dev Script Runner and run your tasks from any #
# nested folder using `dev some-task`.                                        #
# https://github.com/sandstorm/Sandstorm.DevScriptRunner                      #
###############################################################################

source ./dev_utilities.sh

set -e

######### TASKS #########

# Easy setup of the project
function setup() {
  _log_green "Setting up your project"
  _nvm_use
  npm install
}

function start() {
  _log_green "Starting Demo"
  _nvm_use
  npm run dev
}

function test() {
  _log_green "Running tests"
  _nvm_use
  npm run test
}

function build() {
  _log_green "Building package"
  _nvm_use
  npm run build
}

function publish() {
  _log_green "Publishing package"
  _nvm_use
  npm run build
  npm login
  npm publish
}

function create-image-variant() {
  pushd ./demo
    # Array of sizes
    sizes=(400 800 1200 1600 3200)

    # Clean up and create directories
    for size in "${sizes[@]}"; do
        rm -rf "images/$size"
        mkdir -p "images/$size"
    done

    for img in images/unsplash/*.avif; do
        [ -e "$img" ] || continue
        filename=$(basename "$img")
        name="${filename%.*}"

        # Create all size variants
        for size in "${sizes[@]}"; do
            magick convert "$img" -resize "${size}x" "images/$size/${name}.webp"
            echo "Converted: $filename → ${name}.webp ($size px)"
        done
    done

  popd
}

_log_green "---------------------------- RUNNING TASK: $1 ----------------------------"

# THIS NEEDS TO BE LAST!!!
# this will run your tasks
"$@"
