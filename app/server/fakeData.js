const fakeIdentities = [
    {
        "name": "user.1",
        "mspid": "Org1MSP",
        "roles": null,
        "affiliation": "",
        "enrollmentSecret": "",
        "enrollment": {
            "signingIdentity": "aa050b8397bc17f87b206bf31a47aad203e524d0a4bff090cdedd28c6863949e",
            "identity": {
                "certificate": "-----BEGIN CERTIFICATE-----\nMIIDkTCCAzigAwIBAgIUXQ9D3Tm69k7kLWEOVI7LF06WJHwwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMTE2MTIwOTAwWhcNMjEwMTE1MTIx\nNDAwWjAwMR0wDQYDVQQLEwZjbGllbnQwDAYDVQQLEwV1c2VyczEPMA0GA1UEAxMG\ndXNlci4xMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEaYOfFT7SbrS59C8uoAqS\nBYdEFqIpnELpvd/2d5pVFo0kIoIBo1PXi4CkaNEsIP3BzjF1lMM4W9b2dLCP03jK\nv6OCAeswggHnMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQW\nBBT/dy1ok9SaND50AXVYCvNxLgXt5TArBgNVHSMEJDAigCC5PBnCrrW5dqy+SJIL\nCEOkaiPDsZFQNHRp7gmwUmzE2DCCAXkGCCoDBAUGBwgBBIIBa3siYXR0cnMiOnsi\nY24iOiJ1c2VyLjEiLCJnaWROdW1iZXIiOiIxMDAwMSIsImdpdmVuTmFtZSI6InVz\nZXIuMSIsImhvbWVEaXJlY3RvcnkiOiIvaG9tZS91c2VyLjEiLCJsb2dpblNoZWxs\nIjoiL2Jpbi9iYXNoIiwibWFpbCI6InVzZXIuMUBvcmcxLmV4YW1wbGUuY29tIiwi\nbWF4VmFsdWUiOiIxMCIsIm1lbWJlck9mIjoiIiwibWluVmFsdWUiOiI1IiwibyI6\nIm9yZzEiLCJvYmplY3RDbGFzcyI6ImRlbW9WYWx1ZXMsaW5ldE9yZ1BlcnNvbixz\naGFkb3dBY2NvdW50LHBvc2l4QWNjb3VudCIsIm91IjoiQ29uZmlybSIsInNuIjoi\nb3JnMSIsInN0IjoiTm9ydGggQ2Fyb2xpbmEiLCJ1aWQiOiJ1c2VyLjEiLCJ1aWRO\ndW1iZXIiOiIxMDAwMSJ9fTAKBggqhkjOPQQDAgNHADBEAiAyuiRMUuMYWzY8QPbP\nX8YbE5NmYm/CoHurMTOEs0daGgIgUCds3mIGwmg+l9UauVjkO7JvO5PO66SiBzNm\n6PQKy7Y=\n-----END CERTIFICATE-----\n"
            }
        },
        "decodedCertificate": {
            "version": 2,
            "subject": {
                "organizationalUnitName": "users",
                "commonName": "user.1"
            },
            "issuer": {
                "countryName": "US",
                "stateOrProvinceName": "California",
                "localityName": "San Francisco",
                "organizationName": "org1.example.com",
                "commonName": "ca.org1.example.com"
            },
            "serial": "5D0F43DD39BAF64EE42D610E548ECB174E96247C",
            "notBefore": "2020-01-16T12:09:00.000Z",
            "notAfter": "2021-01-15T12:14:00.000Z",
            "subjectHash": "2ed7e91",
            "signatureAlgorithm": "ecdsa-with-SHA256",
            "fingerPrint": "B5:2E:78:EC:79:CB:BF:A3:CE:B7:21:0E:F1:F0:F0:1F:10:47:54:5F",
            "publicKey": {
                "algorithm": "id-ecPublicKey"
            },
            "altNames": [],
            "extensions": {
                "keyUsage": "Digital Signature",
                "basicConstraints": "CA:FALSE",
                "subjectKeyIdentifier": "FF:77:2D:68:93:D4:9A:34:3E:74:01:75:58:0A:F3:71:2E:05:ED:E5",
                "authorityKeyIdentifier": "keyid:B9:3C:19:C2:AE:B5:B9:76:AC:BE:48:92:0B:08:43:A4:6A:23:C3:B1:91:50:34:74:69:EE:09:B0:52:6C:C4:D8",
                "1.2.3.4.5.6.7.8.1": "�k{\"attrs\":{\"cn\":\"user.1\",\"gidNumber\":\"10001\",\"givenName\":\"user.1\",\"homeDirectory\":\"/home/user.1\",\"loginShell\":\"/bin/bash\",\"mail\":\"user.1@org1.example.com\",\"maxValue\":\"10\",\"memberOf\":\"\",\"minValue\":\"5\",\"o\":\"org1\",\"objectClass\":\"demoValues,inetOrgPerson,shadowAccount,posixAccount\",\"ou\":\"Confirm\",\"sn\":\"org1\",\"st\":\"North Carolina\",\"uid\":\"user.1\",\"uidNumber\":\"10001\"}}"
            }
        }
    }
];

const fakeUnits = [
    {
        "key": [
            "Org1MSP",
            "user.1"
        ],
        "value": 100
    }
];

module.exports = {fakeIdentities, fakeUnits};
