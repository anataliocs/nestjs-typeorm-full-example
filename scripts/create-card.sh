#!/bin/bash

set -e

printf "\n Creating card in test Sandbox \n"
printf "\n ------------------------- \n"

curl --location 'https://sandbox.api.caas.reap.global/cards' \
--header 'Accept-Version: v1.0' \
--header 'accept: application/json' \
--header 'content-type: application/json' \
--header 'x-reap-api-key: 9t3e02yy41b47vn82udehmeim' \
--data-raw '{
    "cardType": "Virtual",
    "spendLimit": 0,
    "customerType": "Business",
    "kyc": {
        "fullName": "Chris Anatalio",
        "entityType": "Person",
        "businessName": "Hella Consulting",
        "businessRegistrationNumber": "12345",
        "cardholder": {
            "firstName": "Chris",
            "lastName": "Anatalio",
            "dob": "1984-08-08",
            "residentialAddress": {
                "line1": "string",
                "line2": "string",
                "line3": "string",
                "line4": "string",
                "line5": "string",
                "country": "HKG",
                "postalCode": "string",
                "city": "string"
            },
            "idDocumentType": "Passport",
            "idDocumentNumber": "string",
            "signature": "string",
            "expiresAt": "2025-10-31T13:13:08.177Z"
        },
        "businessOperationAddress": {
            "line1": "string",
            "line2": "string",
            "line3": "string",
            "line4": "string",
            "line5": "string",
            "country": "HKG",
            "postalCode": "string",
            "city": "string"
        },
        "registeredAddress": {
            "line1": "string",
            "line2": "string",
            "line3": "string",
            "line4": "string",
            "line5": "string",
            "country": "HKG",
            "postalCode": "string",
            "city": "string"
        }
    },
    "expiryDate": "2029-08-08",
    "preferredCardName": "Chris Anatalio",
    "meta": {
        "otpPhoneNumber": {
            "dialCode": 1,
            "phoneNumber": "5033472552"
        },
        "id": "string",
        "email": "user@example.com"
    },
    "cardDesign": "1446b2b0-9ad3-4589-84e6-e74ab14e2cce"
}'