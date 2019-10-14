#!/bin/bash

API="http://localhost:3000"
URL_PATH="/books"
TITLE="Educated"
AUTHOR="Tara Westover"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{
    "book": {
      "title": "'"${TITLE}"'",
      "author": "'"${AUTHOR}"'"
    }
  }'

echo
