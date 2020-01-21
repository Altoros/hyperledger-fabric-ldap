package main

import (
	"crypto/x509"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	pb "github.com/hyperledger/fabric-protos-go/peer"
	"strconv"
)

// SimpleAsset implements a simple chaincode to manage an asset
type SimpleAsset struct {
}

const objectType = "Asset"

// Init is called during chaincode instantiation to initialize any
// data. Note that chaincode upgrade also calls this function to reset
// or to migrate data.
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke is called per transaction on the chaincode. Each transaction is
// either a 'get', a 'set', a 'move' or a 'list' on the asset created by Init function. The Set
// method may create a new asset by specifying a new key-value pair.
func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	// Extract the function and args from the transaction proposal
	fn, args := stub.GetFunctionAndParameters()

	if id, err := cid.GetMSPID(stub); err == nil {
		fmt.Println(fmt.Sprintf("MSPID: %s", id))
	}

	if cert, err := cid.GetX509Certificate(stub); err == nil {
		fmt.Println(fmt.Sprintf("CommonName: %s", cert.Subject.CommonName))
		fmt.Println(fmt.Sprintf("OrganizationalUnit: %s", cert.Subject.OrganizationalUnit))
	}

	if fn == "set" {
		return t.set(stub, args)
	} else if fn == "get" { // assume 'get' even if fn is nil
		return t.get(stub, args)
	} else if fn == "delete" {
		return t.delete(stub, args)
	} else if fn == "move" {
		return t.move(stub, args)
	} else if fn == "list" {
		return t.list(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"set\" \"get\" \"move\" \"list\"")
}

// Set stores the asset (both key and value) on the ledger. If the key exists,
// it will override the value with the new one
func (t *SimpleAsset) set(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var id, cn string
	var err error
	var cert *x509.Certificate
	if id, err = cid.GetMSPID(stub); err != nil {
		return shim.Error("Unable to get MSPID")
	}

	if cert, err = cid.GetX509Certificate(stub); err != nil {
		return shim.Error("Unable to get x509 certificate")
	}
	cn = cert.Subject.CommonName

	compositeKey, err := stub.CreateCompositeKey(objectType, []string{id, cn})
	if err != nil {
		return shim.Error("Cannot create composite key")
	}

	// Getting custom attribute for setting value
	initValue := "0"
	if attr, found, err := cid.GetAttributeValue(stub, "initValue"); err == nil && found {
		_, err = strconv.Atoi(attr)
		if err != nil {
			return shim.Error("Invalid init value, expecting a integer value")
		}
		initValue = attr
	}

	err = stub.PutState(compositeKey, []byte(initValue))
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to set asset: %s", compositeKey))
	}
	return shim.Success(nil)
}

//	0	1
//	id	cn
// Get returns the value of the specified asset key (args[0] = id, args[1] = cn)
func (t *SimpleAsset) get(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect arguments. Expecting a key (args[0] = id, args[1] = cn)")
	}

	var id, cn string
	id = args[0]
	cn = args[1]

	compositeKey, err := stub.CreateCompositeKey(objectType, []string{id, cn})
	if err != nil {
		return shim.Error("Cannot create composite key")
	}

	value, err := stub.GetState(compositeKey)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to get asset: %s with error: %s", compositeKey, err))
	}
	if value == nil {
		return shim.Error(fmt.Sprintf("Asset not found: %s", compositeKey))
	}
	return shim.Success(value)
}

//	0	1
//	id	cn
// Deletes an entity from state
func (t *SimpleAsset) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting a key (args[0] = id, args[1] = cn)")
	}

	var id, cn string
	id = args[0]
	cn = args[1]

	compositeKey, err := stub.CreateCompositeKey(objectType, []string{id, cn})
	if err != nil {
		return shim.Error("Cannot create composite key")
	}

	// Delete the key from the state in ledger
	err = stub.DelState(compositeKey)
	if err != nil {
		return shim.Error("Failed to delete state")
	}

	return shim.Success(nil)
}

//	0	1	2
//	x	id	cn
// Transaction makes payment of "x"(args[0]) units from "creater" to "b"(args[1] = id, args[2] = cn)
// and checking by minimum and maximum values
func (t *SimpleAsset) move(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 (args[0] = x, args[1] = id, args[2] = cn)")
	}

	var creatorId, creatorCn string
	var creatorCert *x509.Certificate

	var id, cn string

	var creatorValue, destValue int // Asset holdings
	var x int                       // Transaction value

	var err error

	// Perform the execution
	x, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Invalid transaction amount, expecting an integer value")
	}
	id = args[1]
	cn = args[2]

	if creatorId, err = cid.GetMSPID(stub); err != nil {
		return shim.Error("Unable to get MSPID")
	}

	if creatorCert, err = cid.GetX509Certificate(stub); err != nil {
		return shim.Error("Unable to get x509 certificate")
	}
	creatorCn = creatorCert.Subject.CommonName

	// Get the state from the ledger
	creatorCompositeKey, err := stub.CreateCompositeKey(objectType, []string{creatorId, creatorCn})
	if err != nil {
		return shim.Error("Cannot create composite key a")
	}
	creatorValueBytes, err := stub.GetState(creatorCompositeKey)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if creatorValueBytes == nil {
		return shim.Error("Entity not found")
	}
	creatorValue, _ = strconv.Atoi(string(creatorValueBytes))

	destCompositeKey, err := stub.CreateCompositeKey(objectType, []string{id, cn})
	if err != nil {
		return shim.Error("Cannot create composite key b")
	}
	destValueBytes, err := stub.GetState(destCompositeKey)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if destValueBytes == nil {
		return shim.Error("Entity not found")
	}
	destValue, _ = strconv.Atoi(string(destValueBytes))

	// Getting custom attribute and checking value by minimum
	if attr, found, err := cid.GetAttributeValue(stub, "minValue"); err == nil && found {
		minValue, err := strconv.Atoi(attr)
		if err != nil {
			return shim.Error("Invalid minimum value, expecting a integer value")
		}
		if x < minValue {
			return shim.Error("Transaction amount is smaller than the allowed minimum value")
		}
	}

	// Getting custom attribute and checking value by maximum
	if attr, found, err := cid.GetAttributeValue(stub, "maxValue"); err == nil && found {
		maxValue, err := strconv.Atoi(attr)
		if err != nil {
			return shim.Error("Invalid maximum value, expecting a integer value")
		}
		if x > maxValue {
			return shim.Error("Transaction amount is bigger than the allowed maximum value")
		}
	}

	creatorValue = creatorValue - x
	destValue = destValue + x

	// Write the state back to the ledger
	err = stub.PutState(creatorCompositeKey, []byte(strconv.Itoa(creatorValue)))
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(destCompositeKey, []byte(strconv.Itoa(destValue)))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// list callback representing the list of a chaincode
func (t *SimpleAsset) list(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	// Get the state from the ledger
	assetIterator, err := stub.GetStateByPartialCompositeKey(objectType, []string{})
	if err != nil {
		return shim.Error(fmt.Sprintf("Unable to get state by partial composite key: %s", err.Error()))
	}

	assets := []interface{}{}

	for assetIterator.HasNext() {
		response, err := assetIterator.Next()
		if err != nil {
			message := fmt.Sprintf("Unable to get an element next to an asset iterator: %s", err.Error())
			return shim.Error(message)
		}

		_, compositeKeyParts, err := stub.SplitCompositeKey(response.Key)
		if err != nil {
			message := fmt.Sprintf("cannot split response key into composite key parts slice: %s", err.Error())
			return shim.Error(message)
		}

		byteToInt, err := strconv.Atoi(string(response.Value))
		if err != nil {
			message := fmt.Sprintf("cannot convert byte to int: %s", err.Error())
			return shim.Error(message)
		}

		asset := struct {
			Key   []string `json:"key"`
			Value int      `json:"value"`
		}{
			Key:   compositeKeyParts,
			Value: byteToInt,
		}

		assets = append(assets, asset)
	}

	defer assetIterator.Close()

	bytes, err := json.Marshal(assets)

	return shim.Success(bytes)
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}
