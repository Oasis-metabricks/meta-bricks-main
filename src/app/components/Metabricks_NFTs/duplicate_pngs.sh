#!/bin/bash

duplicate_images() {
    local type=$1
    local count=$2
    local dir=$3

    cd $dir || exit
    for i in $(seq 1 $count); do
        cp ${type}_Brick.png ${type}_Brick_$i.png
    done
    cd ..
}

duplicate_images "Regular" 420 "Regular_Brick"
duplicate_images "Industrial" 112 "Industrial_Brick"
duplicate_images "Legendary" 28 "Legendary_Brick"
