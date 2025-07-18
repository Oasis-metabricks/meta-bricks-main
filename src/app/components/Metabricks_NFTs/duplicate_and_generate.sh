#!/bin/bash

# Create assets and metadata folders
mkdir -p assets
mkdir -p metadata

BASE_URL="assets"
WALLET_ADDRESS="5asLfkbBXe3N8sJ8JQfRuSGxUJHhMGjnY2hRyqcJSuaW"
SYMBOL="MBRK"
FEE="500"

# Function to duplicate images and generate metadata
duplicate_and_generate() {
    local type=$1
    local count=$2
    local base_filename=$3
    local type_lower=$(echo "$type" | tr '[:upper:]' '[:lower:]')

    for i in $(seq 1 $count); do
        cp ${type}_Brick.png assets/${type_lower}_brick_$i.png
        cat <<EOF > metadata/${type_lower}_brick_$i.json
{
  "name": "$type Brick #$i",
  "symbol": "$SYMBOL",
  "description": "A $type Brick from the Metabricks collection.",
  "seller_fee_basis_points": $FEE,
  "image": "$BASE_URL/${type_lower}_brick_$i.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "$type"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "$BASE_URL/${type_lower}_brick_$i.png",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
EOF
    done
}

# Duplicate images and generate metadata for each type
duplicate_and_generate "Regular" 420 "regular_brick"
duplicate_and_generate "Industrial" 112 "industrial_brick"
duplicate_and_generate "Legendary" 28 "legendary_brick"
