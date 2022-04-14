/*
 * USAGE:  node MenuItemAccessor_Tester [passes | help]
 *
 * By default, only failures and errors are reported to the console.
 * So, if all tests pass, there will be no output.
 *
 * To see pass/fail information for each test, include "passes".
 * To see this usage message, include "help".
 *
 * Run "resetDataset.bat" between uses to restore the dataset to
 * its original state.
 */
if (
    process.argv.length > 3 ||
    (process.argv.length === 3 && process.argv[2] !== "passes")
) {
    showHelpAndQuit();
}

const acc = require("./MenuItemAccessor.js");
const builder = require("./builder.js");
const showPasses = process.argv.length === 3 && process.argv[2] === "passes";
const testItems = defineTestItems();
const originalNumberOfItems = 39;

runTests();

async function runTests () {
    await builder.build();
    // These tests do not change the dataset.
    await testGetAllItems();
    await testItemExists_ShouldSucceed();
    await testItemExists_ShouldFail();
    await testGetItemByID_ShouldSucceed();
    await testGetItemByID_ShouldFail();
    await testDeleteItem_ShouldFail();
    await testAddItem_ShouldFail();
    await testUpdateItem_ShouldFail();

    // These tests change the dataset (but also reset it when done).
    await testDeleteItem_ShouldSucceed();
    await testAddItem_ShouldSucceed();
    await testUpdateItem_ShouldSucceed();
}

async function testGetAllItems() {
    let description, errorMessage, pass;
    description = "Get all the items";
    errorMessage = "";

    try {
        let docs = await acc.getAllItems();
        pass = docs.length === originalNumberOfItems;
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testItemExists_ShouldSucceed() {
    let description, errorMessage, pass;
    description = "itemExists with item that exists in dataset";
    errorMessage = "";

    try {
        pass = await acc.itemExists(testItems.goodItem);
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testItemExists_ShouldFail() {
    let description, errorMessage, pass;
    description = "itemExists with item that does NOT exist in dataset";
    errorMessage = "";
    try {
        pass = !(await acc.itemExists(testItems.badItem));
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testGetItemByID_ShouldSucceed() {
    let description, errorMessage, pass;
    description = "getItemByID with valid ID";
    errorMessage = "";
    try {
        let item = await acc.getItemByID(testItems.goodItem.id);
        pass = item !== null && item.id === testItems.goodItem.id;
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testGetItemByID_ShouldFail() {
    let description, errorMessage, pass;
    description = "getItemByID with invalid ID";
    errorMessage = "";
    try {
        let item = await acc.getItemByID(testItems.badItem.id);
        pass = item === null;
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testDeleteItem_ShouldFail() {
    let description, errorMessage, pass;
    description = "deleteItem with item that does NOT exist in dataset";
    errorMessage = "";
    try {
        pass = !(await acc.deleteItem(testItems.badItem));
        // make sure number of items hasn't changed
        let docs = await acc.getAllItems();
        pass = pass && docs.length === originalNumberOfItems;
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testAddItem_ShouldFail() {
    let description, errorMessage, pass;
    description = "addItem with item that already exists in dataset";
    errorMessage = "";
    try {
        pass = !(await acc.addItem(testItems.goodItem));
        // make sure number of items hasn't changed
        let docs = await acc.getAllItems();
        pass = pass && docs.length === originalNumberOfItems;
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testUpdateItem_ShouldFail() {
    let description, errorMessage, pass;
    description = "updateItem with item that does NOT exist in dataset";
    errorMessage = "";
    try {
        pass = !(await acc.updateItem(testItems.badItem));
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
    }
}

async function testDeleteItem_ShouldSucceed() {
    let description, errorMessage, pass;
    description = "deleteItem with item that exists in dataset";
    errorMessage = "";
    try {
        pass = await acc.deleteItem(testItems.itemToDelete);
        // make sure item no longer exists in dataset
        pass = pass && !(await acc.itemExists(testItems.itemToDelete));
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
        await builder.build(); // reset the dataset
    }
}

async function testAddItem_ShouldSucceed() {
    let description, errorMessage, pass;
    description = "addItem with item that does NOT exist in dataset";
    errorMessage = "";
    try {
        pass = await acc.addItem(testItems.itemToAdd);
        // make sure item now exists in dataset
        pass = pass && (await acc.itemExists(testItems.itemToAdd));
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
        await builder.build(); // reset the dataset
    }
}

async function testUpdateItem_ShouldSucceed() {
    let description, errorMessage, pass;
    description = "updateItem with item that exists in dataset";
    errorMessage = "";
    try {
        pass = await acc.updateItem(testItems.itemToUpdate);
        if (pass) {
            // make sure item has changed
            let item = await acc.getItemByID(testItems.itemToUpdate.id);
            pass = pass && item.category === testItems.itemToUpdate.category;
            pass =
                pass && item.description === testItems.itemToUpdate.description;
            pass = pass && item.price === testItems.itemToUpdate.price;
            pass =
                pass && item.vegetarian === testItems.itemToUpdate.vegetarian;
        }
    } catch (err) {
        pass = false;
        errorMessage = err;
    } finally {
        report(description, pass, errorMessage);
        await builder.build(); // reset the dataset
    }
} 

//*** HELPERS ***//
function report(title, pass, err) {
    if (!pass || showPasses) {
        console.log((pass ? "PASS" : "FAIL") + ": " + title);
        if (err) {
            console.log("$$$ " + err);
        }
    }
}

function showHelpAndQuit() {
    let msg = "\nUSAGE:  node MenuItemAccessor_Tester [passes | help]\n\n";
    msg +=
        "\tBy default, only failures and errors are reported to the console.\n";
    msg += "\tSo, if all tests pass, there will be no output.\n\n";
    msg += '\tTo see pass/fail information for each test, include "passes".\n';
    msg += '\tTo see this usage message, include "help".\n\n';
    msg += '\tRun "resetDataset.bat" between uses to restore the dataset\n';
    msg += "\tto its original state.";
    console.log(msg);
    process.exit(0);
}

function defineTestItems() {
    return {
        goodItem: {
            id: 107,
            category: "",
            description: "",
            price: 0,
            vegetarian: false,
        },
        badItem: {
            id: 777,
            category: "",
            description: "",
            price: 0,
            vegetarian: false,
        },
        itemToDelete: {
            id: 202,
            category: "",
            description: "",
            price: 0,
            vegetarian: false,
        },
        itemToAdd: {
            id: 888,
            category: "ENT",
            description: "Poutine",
            price: 11,
            vegetarian: false,
        },
        itemToUpdate: {
            id: 303,
            category: "ENT",
            description: "description of item after update",
            price: 11,
            vegetarian: false,
        },
    };
}
