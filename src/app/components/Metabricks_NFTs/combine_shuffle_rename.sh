#!/bin/bash

# Create the final assets directory
mkdir -p final_assets

# Combine PNG and JSON file paths into temporary files
find assets -name "*.png" | sort > png_list.txt
find metadata -name "*.json" | sort > json_list.txt

# Ensure the lists have the same number of items
if [ $(wc -l < png_list.txt) -ne $(wc -l < json_list.txt) ]; then
    echo "Error: Mismatched number of PNG and JSON files"
    exit 1
fi

# Combine the lists and shuffle them using Python
paste png_list.txt json_list.txt > combined_list.txt

python3 << EOF
import random

# Read combined list
with open('combined_list.txt', 'r') as file:
    lines = file.readlines()

# Shuffle the lines
random.shuffle(lines)

# Write the shuffled lines back to a new file
with open('shuffled_list.txt', 'w') as file:
    file.writelines(lines)
EOF

# Rename and move files according to the shuffled list
counter=0
while IFS=$'\t' read -r png json; do
    mv "$png" final_assets/${counter}.png
    mv "$json" final_assets/${counter}.json
    counter=$((counter + 1))
done < shuffled_list.txt

# Clean up
rm png_list.txt json_list.txt combined_list.txt shuffled_list.txt
