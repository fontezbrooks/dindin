#!/bin/bash

echo "Testing new recipe schema..."

# Use curl to test the API directly
curl "http://localhost:3000/trpc/recipe.getRecipeStack?input=%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo ""
echo "✅ Test complete!"