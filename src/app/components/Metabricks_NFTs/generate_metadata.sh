#!/bin/bash

BASE_URL="assets"
WALLET_ADDRESS="5asLfkbBXe3N8sJ8JQfRuSGxUJHhMGjnY2hRyqcJSuaW"
SYMBOL="MBRK"
FEE="500"

# Create metadata folder
mkdir -p metadata

generate_metadata() {
    local type=$1
    local count=$2
    local base_filename=$3

    # Convert type to lowercase using `tr`
    local type_lower=$(echo "$type" | tr '[:upper:]' '[:lower:]')

    for i in $(seq 1 $count); do
        cat <<EOF > metadata/${type_lower}_brick_$i.json
{
  "name": "$type Brick #$i",
  "symbol": "$SYMBOL",
  "description": "A $type Brick from the Metabricks collection.",
  "seller_fee_basis_points": $FEE,
  "image": "$BASE_URL/${base_filename}_${i}.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "$type"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "$BASE_URL/${base_filename}_${i}.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "$WALLET_ADDRESS",
        "share": 100
      }
    ]
  }
}
EOF
    done
}

# Generate metadata for each type
generate_metadata "Regular" 420 "Regular_Brick"
generate_metadata "Industrial" 112 "Industrial_Brick"
generate_metadata "Legendary" 28 "Legendary_Brick"
