const fakeIdentities = [
    {
        "name": "admin",
        "mspid": "Org1MSP",
        "roles": null,
        "affiliation": "",
        "enrollmentSecret": "",
        "enrollment": {
            "signingIdentity": "368338d18a9387b50968eb1599bc71efb29e1328fcac82dfaf51bd8c7cdd365a",
            "identity": {
                "certificate": "-----BEGIN CERTIFICATE-----\nMIIDhjCCAy2gAwIBAgIUbkZzqWlE2pCgI5+sBcrHxWHbAQswCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMTE0MDgzNTAwWhcNMjEwMTEzMDg0\nMDAwWjA+MSwwDQYDVQQLEwZjbGllbnQwDQYDVQQLEwZmYWJyaWMwDAYDVQQLEwV1\nc2VyczEOMAwGA1UEAxMFYWRtaW4wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATt\niw23k5nKZS+N7pfg83hLiSMZ0A/V2SAmg5efcIJ/J+/Th/vb7hMJt2w2OPw7xZTC\nF8sTHUvMHqW7CDuSenxGo4IB0jCCAc4wDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB\n/wQCMAAwHQYDVR0OBBYEFPKVLTCc810Bh3LJ67XhlDcw3026MCsGA1UdIwQkMCKA\nIDHe8oqqWFex9y5Ihq0cWnO6+fLgvKyzs4VKXroza7S7MIIBYAYIKgMEBQYHCAEE\nggFSeyJhdHRycyI6eyJjbiI6ImFkbWluIiwiZ2lkTnVtYmVyIjoiMTAwMDIiLCJn\naXZlbk5hbWUiOiJhZG1pbiIsImhvbWVEaXJlY3RvcnkiOiIvaG9tZS9hZG1pbiIs\nImxvZ2luU2hlbGwiOiIvYmluL2Jhc2giLCJtYWlsIjoiYWRtaW5AaHlwZXJsZWRl\nZ2VyLmV4YW1wbGUuY29tIiwibWVtYmVyT2YiOiIiLCJvIjoiSHlwZXJsZWRnZXIi\nLCJvYmplY3RDbGFzcyI6InBvc2l4QWNjb3VudCxzaGFkb3dBY2NvdW50LGluZXRP\ncmdQZXJzb24iLCJvdSI6IkZhYnJpYyIsInNuIjoiSHlwZXJsZWRlZ2VyIiwic3Qi\nOiJOb3J0aCBDYXJvbGluYSIsInVpZCI6ImFkbWluIiwidWlkTnVtYmVyIjoiMTAw\nMDIifX0wCgYIKoZIzj0EAwIDRwAwRAIgGRGWr0dXfINWBp0CznMpzByZ3agcO79n\nqoiruxW+QOwCIAlyS0m9HGemYBJfA2JjImNpX4yOsLNq/R+1k9jDeo7/\n-----END CERTIFICATE-----\n"
            }
        }
    },
    {
        "name": "revoker",
        "mspid": "Org1MSP",
        "roles": null,
        "affiliation": "",
        "enrollmentSecret": "",
        "enrollment": {
            "signingIdentity": "02482600bb02f0243fd8dc5eaece718bd92646bd759c7a32b0865ee9ae6bfd7b",
            "identity": {
                "certificate": "-----BEGIN CERTIFICATE-----\nMIIDkjCCAzmgAwIBAgIUB+BmwFErFBeaw/vwb8Z3A57HYgUwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMTE0MDgyNzAwWhcNMjEwMTEzMDgz\nMjAwWjBAMSwwDQYDVQQLEwZjbGllbnQwDQYDVQQLEwZmYWJyaWMwDAYDVQQLEwV1\nc2VyczEQMA4GA1UEAxMHcmV2b2tlcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBF+UeOFw/DlMHaq8/s1LoI/4AMVgPlqUSULdyjg3xIBV7ihDEyV1CTChFGa4wd/U\nvMAtTX/5swTvCEpWwsesrm2jggHcMIIB2DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUTR4d6GlLdGEPBqHNkKv+E2iVAy4wKwYDVR0jBCQw\nIoAgMd7yiqpYV7H3LkiGrRxac7r58uC8rLOzhUpeujNrtLswggFqBggqAwQFBgcI\nAQSCAVx7ImF0dHJzIjp7ImNuIjoicmV2b2tlciIsImdpZE51bWJlciI6IjEwMDAz\nIiwiZ2l2ZW5OYW1lIjoicmV2b2tlciIsImhvbWVEaXJlY3RvcnkiOiIvaG9tZS9y\nZXZva2VyIiwibG9naW5TaGVsbCI6Ii9iaW4vYmFzaCIsIm1haWwiOiJyZXZva2Vy\nQGh5cGVybGVkZWdlci5leGFtcGxlLmNvbSIsIm1lbWJlck9mIjoiIiwibyI6Ikh5\ncGVybGVkZ2VyIiwib2JqZWN0Q2xhc3MiOiJwb3NpeEFjY291bnQsc2hhZG93QWNj\nb3VudCxpbmV0T3JnUGVyc29uIiwib3UiOiJGYWJyaWMiLCJzbiI6Ikh5cGVybGVk\nZWdlciIsInN0IjoiTm9ydGggQ2Fyb2xpbmEiLCJ1aWQiOiJyZXZva2VyIiwidWlk\nTnVtYmVyIjoiMTAwMDMifX0wCgYIKoZIzj0EAwIDRwAwRAIgHTML+I9+QbRMxSs6\nTVDKRYategMkSLTv0USfnar/OOMCIFVAQCjYdg603ANomL8OgB0e7BilO6hltWA4\nn28I708s\n-----END CERTIFICATE-----\n"
            }
        }
    }
];


const fakeQuery = [
    {

    }
];

module.exports = {fakeIdentities};